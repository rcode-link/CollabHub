import { Extension } from '@tiptap/vue-3';
import { Decoration, DecorationSet } from "prosemirror-view";
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { useUserStore } from "../../../store/user.js";

/**
 * Enhanced cursor display and management for collaborative editing
 */
export const Cursors = Extension.create({
    name: 'cursors',
    
    // Default options
    addOptions() {
        return {
            // CSS class for cursor
            cursorClass: 'collaboration-cursor',
            // CSS class for text selection
            selectionClass: 'collaboration-selection',
            // How long to show user label (ms)
            labelDuration: 2000
        };
    },
    
    // Internal storage
    addStorage() {
        return {
            // Current user information
            currentUser: useUserStore().user,
            // Map of display timeouts for user labels by client ID
            labelTimeouts: new Map(),
        };
    },
    
    // Commands to control cursor behavior
    addCommands() {
        return {
            // Update collaborative cursors with selection data from other users
            updateColabCursors: (selections) => () => {
                if (!selections || !Array.isArray(selections) || !selections.length) {
                    return false;
                }
                
                try {
                    const { tr } = this.editor.state;
                    const transaction = tr
                        .setMeta('selections', selections)
                        .setMeta('addToHistory', false);
                    
                    this.editor.view.dispatch(transaction);
                    return true;
                } catch (error) {
                    console.error('Error updating collaborative cursors:', error);
                    return false;
                }
            }
        };
    },
    
    // Add ProseMirror plugins for rendering cursors
    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('collaboration-cursors'),
                
                // Initialize with empty decoration set
                state: {
                    init: (_, { doc }) => {
                        return DecorationSet.create(doc, []);
                    },
                    
                    // Apply changes to decorations when transactions occur
                    apply: (transaction, oldSet, oldState, newState) => {
                        // Maps decorations to new document positions
                        const mapped = oldSet.map(transaction.mapping, transaction.doc);
                        
                        // Check if we have new cursor data
                        const selections = transaction.getMeta('selections');
                        if (!selections) {
                            return mapped;
                        }
                        
                        // Generate decorations from selection data
                        return this.getDecorations(newState.doc, selections);
                    }
                },
                
                // Pass decorations to the view
                props: {
                    decorations(state) {
                        return this.getState(state);
                    }
                }
            })
        ];
    },
    
    // Methods
    methods: {
        // Generate decorations for other users' cursors and selections
        getDecorations(doc, selections) {
            // Skip if no selections or not an array
            if (!selections || !Array.isArray(selections)) {
                return DecorationSet.empty;
            }
            
            // Extract current user ID to filter out own cursor
            const userId = this.storage.currentUser.id;
            
            // Build list of decorations from selections
            const decorations = selections
                .filter(selection => {
                    // Filter out own cursor and invalid selections
                    return selection.clientID !== userId && 
                           selection.selection && 
                           typeof selection.selection.from === 'number' && 
                           typeof selection.selection.to === 'number';
                })
                .map(selection => {
                    const { from, to } = selection.selection;
                    const decors = [];
                    
                    // User information for styling
                    const user = selection.user || { 
                        id: selection.clientID,
                        name: `User ${selection.clientID}`,
                        color: this.getColorForUser(selection.clientID)
                    };
                    const color = user.color;
                    
                    // Create cursor element at the end of selection
                    const cursorElement = document.createElement('span');
                    cursorElement.className = `${this.options.cursorClass} user-${selection.clientID}`;
                    cursorElement.style.borderLeftColor = color; // Cursor color
                    
                    // Create label with user name
                    const labelElement = document.createElement('div');
                    labelElement.className = 'collaboration-cursor-label';
                    labelElement.textContent = user.name;
                    labelElement.style.backgroundColor = color;
                    
                    // Add label to cursor
                    cursorElement.appendChild(labelElement);
                    
                    // Add cursor decoration
                    decors.push(Decoration.widget(to, () => cursorElement, { key: `cursor-${selection.clientID}` }));
                    
                    // If there's a selection range (not just a cursor position), add selection decoration
                    if (from !== to) {
                        // Create selection highlight
                        decors.push(
                            Decoration.inline(
                                from, 
                                to, 
                                {
                                    class: `${this.options.selectionClass} selection-${selection.clientID}`,
                                    style: `background-color: ${color}33;` // Add transparency to selection color
                                },
                                { key: `selection-${selection.clientID}` }
                            )
                        );
                    }
                    
                    // Handle label timeouts - show for a limited time
                    this.manageLabelTimeout(selection.clientID);
                    
                    return decors;
                })
                .flat();
            
            // Create and return decoration set
            return DecorationSet.create(doc, decorations);
        },
        
        // Handle cursor label visibility timeouts
        manageLabelTimeout(clientId) {
            // Clear existing timeout if any
            if (this.storage.labelTimeouts.has(clientId)) {
                clearTimeout(this.storage.labelTimeouts.get(clientId));
            }
            
            // Set label to visible
            document.documentElement.style.setProperty(
                `--cursor-${clientId}-label-display`, 
                'block'
            );
            
            // Set timeout to hide label after duration
            const timeoutId = setTimeout(() => {
                document.documentElement.style.setProperty(
                    `--cursor-${clientId}-label-display`, 
                    'none'
                );
                this.storage.labelTimeouts.delete(clientId);
            }, this.options.labelDuration);
            
            // Store timeout ID for later cleanup
            this.storage.labelTimeouts.set(clientId, timeoutId);
        },
        
        // Generate a deterministic color for a user based on ID
        getColorForUser(id) {
            // Hash the ID to a number
            const hash = String(id).split('').reduce((acc, char) => {
                return char.charCodeAt(0) + ((acc << 5) - acc);
            }, 0);
            
            // Generate a hue value from the hash
            const hue = hash % 360;
            
            // Return HSL color with fixed saturation and lightness
            return `hsl(${hue}, 70%, 60%)`;
        }
    },
    
    // Add CSS for cursors
    onCreate() {
        // Add global styles for cursors if not already added
        if (!document.getElementById('collaboration-cursor-styles')) {
            const style = document.createElement('style');
            style.id = 'collaboration-cursor-styles';
            style.innerHTML = `
                .collaboration-cursor {
                    position: relative;
                    border-left: 2px solid;
                    border-radius: 2px;
                    margin-left: -1px;
                    height: 1.2em;
                    display: inline-block;
                    pointer-events: none;
                }
                
                .collaboration-cursor-label {
                    position: absolute;
                    top: -1.4em;
                    left: -1px;
                    font-size: 12px;
                    border-radius: 3px;
                    padding: 1px 4px;
                    white-space: nowrap;
                    color: white;
                    font-weight: 500;
                    pointer-events: none;
                    user-select: none;
                }
                
                .collaboration-selection {
                    border-radius: 2px;
                    pointer-events: none;
                }
            `;
            document.head.appendChild(style);
        }
    },
    
    // Clean up timeouts
    onDestroy() {
        // Clear all cursor label timeouts
        for (const timeoutId of this.storage.labelTimeouts.values()) {
            clearTimeout(timeoutId);
        }
        this.storage.labelTimeouts.clear();
    }
});
