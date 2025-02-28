import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

// Create a unique key for our plugin
const blockHoverPluginKey = new PluginKey('blockHoverActions');

// Helper function to create action button DOM elements
const createActionButton = (position, icon, title, onClick) => {
  const button = document.createElement('div');
  button.className = `block-hover-action-button block-hover-action-button-${position}`;
  button.setAttribute('title', title);
  
  // Create the icon container
  const iconContainer = document.createElement('div');
  iconContainer.className = 'block-hover-action-icon-container';
  
  // Add the plus icon 
  const iconSpan = document.createElement('span');
  iconSpan.className = 'block-hover-action-icon';
  iconSpan.innerHTML = icon;
  
  // Assemble the button
  iconContainer.appendChild(iconSpan);
  button.appendChild(iconContainer);
  
  button.addEventListener('click', onClick);
  return button;
};

// Helper to determine if a node is a valid block for our hover actions
const isValidBlock = (node) => {
  // Check for common node types to exclude
  const excludedTypes = ['tableCell', 'tableHeader', 'tableRow', 'doc'];
  
  // Check if this is a block node
  const isBlock = node.isBlock || node.type.name === 'drawIoExtension';
  
  // Make sure it's not an excluded type
  const isNotExcluded = !excludedTypes.includes(node.type.name);
  
  return isBlock && isNotExcluded;
};

export const BlockHoverActions = Extension.create({
  name: 'blockHoverActions',

  addProseMirrorPlugins() {
    const plugin = new Plugin({
      key: blockHoverPluginKey,
      state: {
        init() {
          return {
            hoveredNode: null,
            hoveredPos: null,
            selectedNode: null,
            selectedPos: null,
            isActive: false
          };
        },
        apply(tr, prev) {
          // Keep track of the selection changes
          const selection = tr.selection;
          let selectedNode = null;
          let selectedPos = null;

          // Find the block at the current selection
          if (selection) {
            // Get the node at the start of the selection
            const $from = selection.$from;
            let depth = $from.depth;
            
            // Traverse up to find a valid block node
            while (depth > 0) {
              const node = $from.node(depth);
              if (isValidBlock(node)) {
                selectedNode = node;
                selectedPos = $from.before(depth);
                break;
              }
              depth--;
            }
            
            // If no valid block found yet, check the parent
            if (!selectedNode) {
              const node = $from.parent;
              if (isValidBlock(node)) {
                selectedNode = node;
                selectedPos = $from.before($from.depth);
              }
            }
          }
          
          return {
            ...prev,
            selectedNode,
            selectedPos
          };
        },
      },
      view(editorView) {
        return {
          update(view, prevState) {
            const currentState = view.state;
            const pluginState = plugin.getState(currentState);
            const prevPluginState = plugin.getState(prevState);
            
            // Check if selection has changed
            if (pluginState.selectedNode !== prevPluginState.selectedNode || 
                pluginState.selectedPos !== prevPluginState.selectedPos) {
                
              // If we have a selected node, add decoration with embedded buttons
              if (pluginState.selectedNode && pluginState.selectedPos !== null) {
                // Add selection decoration
                view.dispatch(view.state.tr.setMeta(plugin, { 
                  update: true, 
                  decorationClass: pluginState.selectedNode.type.name === 'drawIo' ? 
                    'drawio-selected' : 'block-selected',
                  selectedNode: pluginState.selectedNode,
                  selectedPos: pluginState.selectedPos
                }));
              } else {
                // Remove selection decoration
                view.dispatch(view.state.tr.setMeta(plugin, { update: true }));
              }
            }
          },
          destroy() {
            // Clean up if needed
          }
        };
      },
      props: {
        handleDOMEvents: {
          mouseover(view, event) {
            // Get the current mouse position in the document
            const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
            if (!pos) return false;

            // Get the position and node at the mouse position
            const { doc } = view.state;
            let hoveredNode = null;
            let hoveredPos = null;

            // Find the block node at this position
            doc.nodesBetween(pos.pos, pos.pos, (node, nodePos) => {
              if (isValidBlock(node)) {
                hoveredNode = node;
                hoveredPos = nodePos;
                return false; // Stop recursion
              }
              return true;
            });

            const pluginState = plugin.getState(view.state);
            
            // If we're hovering over a new block, update the hover state
            if (hoveredNode !== pluginState.hoveredNode) {
              pluginState.hoveredNode = hoveredNode;
              pluginState.hoveredPos = hoveredPos;
              
              if (hoveredNode) {
                // Just add decoration for hover
                view.dispatch(view.state.tr.setMeta(plugin, { 
                  update: true,
                  hoverOnly: true,
                  decorationClass: hoveredNode.type.name === 'drawIoExtension' ? 
                    'drawio-hover-highlighted' : 'block-hover-highlighted'
                }));
              } else {
                // Remove hover decoration if not hovering over any block
                view.dispatch(view.state.tr.setMeta(plugin, { 
                  update: true,
                  hoverOnly: true
                }));
              }
            }
            
            return false;
          },
          
          mouseout(view, event) {
            const pluginState = plugin.getState(view.state);
            
            // Clear hover state if mouse leaves a block
            if (pluginState.hoveredNode) {
              const relatedTarget = event.relatedTarget;
              if (!view.dom.contains(relatedTarget) || !relatedTarget.closest('.ProseMirror')) {
                pluginState.hoveredNode = null;
                pluginState.hoveredPos = null;
                
                // Remove hover decoration
                view.dispatch(view.state.tr.setMeta(plugin, { 
                  update: true,
                  hoverOnly: true
                }));
              }
            }
            
            return false;
          },
          
          // Handle click events from our embedded buttons
          click(view, event) {
            // Check if this is a click on one of our buttons
            const targetButton = event.target.closest('.block-hover-action-button');
            if (!targetButton) return false;
            
            event.preventDefault();
            event.stopPropagation();
            
            const pluginState = plugin.getState(view.state);
            if (!pluginState.selectedNode || pluginState.selectedPos === null) return false;
            
            // Determine which button was clicked
            if (targetButton.classList.contains('block-hover-action-button-top')) {
              // Add before button was clicked
              // Create a new paragraph node before this one
              const tr = view.state.tr;
              tr.insert(pluginState.selectedPos, view.state.schema.nodes.paragraph.create());
              view.dispatch(tr);
              
              // Set selection to the new node
              const newTr = view.state.tr;
              newTr.setSelection(view.state.selection.constructor.near(
                view.state.doc.resolve(pluginState.selectedPos)
              ));
              view.dispatch(newTr);
              view.focus();
            } else if (targetButton.classList.contains('block-hover-action-button-bottom')) {
              // Add after button was clicked
              // Create a new paragraph node after this one
              const nodePos = pluginState.selectedPos + pluginState.selectedNode.nodeSize;
              const tr = view.state.tr;
              tr.insert(nodePos, view.state.schema.nodes.paragraph.create());
              view.dispatch(tr);
              
              // Set selection to the new node
              const newTr = view.state.tr;
              newTr.setSelection(view.state.selection.constructor.near(
                view.state.doc.resolve(nodePos)
              ));
              view.dispatch(newTr);
              view.focus();
            }
            
            return true;
          }
        },
        
        // Add decorations for hover and selection with embedded buttons
        decorations(state) {
          const pluginState = this.getState(state);
          const decorations = [];
          const meta = state.tr.getMeta(plugin);
          
          // Handle hover decorations
          if (meta?.hoverOnly && pluginState.hoveredNode && pluginState.hoveredPos) {
            const decorationClass = meta.decorationClass || 'block-hover-highlighted';
            
            decorations.push(
              Decoration.node(
                pluginState.hoveredPos, 
                pluginState.hoveredPos + pluginState.hoveredNode.nodeSize, 
                { class: decorationClass }
              )
            );
          }
          
          // Handle selection decorations (including embedded buttons)
          if (!meta?.hoverOnly && pluginState.selectedNode && pluginState.selectedPos) {
            const decorationClass = meta?.decorationClass || 'block-selected';
            const isDrawIo = pluginState.selectedNode.type.name === 'drawIoExtension';
            
            // SVG icon for buttons
            const plusIconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>';
            
            // Create embedded buttons with default no-op click handlers
            const topButton = createActionButton(
              'top', 
              plusIconSvg, 
              'Add before', 
              (e) => {
                // Prevent default and stop propagation to let the plugin handle it
                e.preventDefault();
                e.stopPropagation();
              }
            );
            
            const bottomButton = createActionButton(
              'bottom', 
              plusIconSvg, 
              'Add after', 
              (e) => {
                // Prevent default and stop propagation to let the plugin handle it
                e.preventDefault();
                e.stopPropagation();
              }
            );
            
            // Add both the class and the embedded buttons
            decorations.push(
              Decoration.node(
                pluginState.selectedPos, 
                pluginState.selectedPos + pluginState.selectedNode.nodeSize, 
                { 
                  class: decorationClass, 
                  'data-has-buttons': 'true',
                },
                {
                  topButton,
                  bottomButton
                }
              )
            );
          }
          
          return DecorationSet.create(state.doc, decorations);
        }
      }
    });
    
    return [plugin];
  }
});

export default BlockHoverActions;
