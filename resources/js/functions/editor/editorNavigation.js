import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { Extension } from '@tiptap/core';

// Create a unique key for our plugin
const editorNavigationPluginKey = new PluginKey('editor-navigation');

// Distance from table edge that activates resize cursor, in pixels
const RESIZE_HANDLE_WIDTH = 8;

export const EditorNavigation = Extension.create({
  name: 'editorNavigation',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: editorNavigationPluginKey,
        props: {
          // Add special handling for our mouse cursor behavior
          handleDOMEvents: {
            mousemove: (view, event) => {
              // Get mouse position and target element
              const target = event.target;
              
              // Check if we're near a table edge for resizing
              if (target && target.tagName && (
                  target.tagName === 'TD' || 
                  target.tagName === 'TH' || 
                  target.closest('table')
              )) {
                const table = target.tagName === 'TABLE' ? target : target.closest('table');
                if (table) {
                  const rect = table.getBoundingClientRect();
                  const rightEdge = Math.abs(rect.right - event.clientX) <= RESIZE_HANDLE_WIDTH;
                  const bottomEdge = Math.abs(rect.bottom - event.clientY) <= RESIZE_HANDLE_WIDTH;
                  
                  if (rightEdge && bottomEdge) {
                    document.body.style.cursor = 'nwse-resize';
                    return true;
                  } else if (rightEdge) {
                    document.body.style.cursor = 'col-resize';
                    return true;
                  } else if (bottomEdge) {
                    document.body.style.cursor = 'row-resize';
                    return true;
                  }
                }
              }
              
              // Reset cursor if not over a resizable edge
              if (document.body.style.cursor !== '' && 
                  document.body.style.cursor !== 'auto' && 
                  document.body.style.cursor !== 'text') {
                document.body.style.cursor = '';
              }
              
              return false;
            },
            
            // Ensure cursor resets when mouse leaves the editor
            mouseout: () => {
              document.body.style.cursor = '';
              return false;
            }
          },
          
          // Add decorations to enhance visibility of selected elements
          decorations: (state) => {
            const { doc, selection } = state;
            const decorations = [];
            
            // Helper to check if we're working with a node selection
            const isNodeSelection = selection.node !== undefined;
            
            // Function to find the current parent block node
            const findCurrentBlock = (pos) => {
              let currentBlock = null;
              let currentDepth = 0;
              
              doc.nodesBetween(pos - 1, pos + 1, (node, pos, parent, index) => {
                // Find the highest level block that can be considered "current"
                if (node.isBlock && (!currentBlock || node.type.name !== 'paragraph')) {
                  currentBlock = { node, pos };
                }
                return true;
              });
              
              return currentBlock;
            };
            
            // If there's a text selection, find the parent blocks
            if (selection.from !== selection.to && !isNodeSelection) {
              // Get parent blocks at the boundaries of selection
              const startBlock = findCurrentBlock(selection.from);
              const endBlock = findCurrentBlock(selection.to);
              
              // Add decorations for the current selection's containing blocks
              if (startBlock) {
                decorations.push(
                  Decoration.node(
                    startBlock.pos, 
                    startBlock.pos + startBlock.node.nodeSize, 
                    { class: 'navigation-highlighted-block' }
                  )
                );
              }
              
              // If end block is different from start block, decorate it too
              if (endBlock && endBlock.pos !== startBlock?.pos) {
                decorations.push(
                  Decoration.node(
                    endBlock.pos, 
                    endBlock.pos + endBlock.node.nodeSize, 
                    { class: 'navigation-highlighted-block' }
                  )
                );
              }
            }
            
            // If there's a node selection (like a selected table), highlight it
            if (isNodeSelection) {
              decorations.push(
                Decoration.node(
                  selection.from, 
                  selection.to, 
                  { class: 'navigation-selected-node' }
                )
              );
            }
            
            // Special highlighting for tables
            const tableNodes = [];
            doc.descendants((node, pos) => {
              if (node.type.name === 'table') {
                tableNodes.push({ node, pos });
              }
              return true;
            });
            
            // Add resize handles to all tables
            tableNodes.forEach(({ node, pos }) => {
              // Right resize handle
              decorations.push(
                Decoration.node(
                  pos, 
                  pos + node.nodeSize, 
                  { class: 'navigation-table-with-handles' }
                )
              );
            });
            
            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  },
});

// Export default for easier imports
export default EditorNavigation;
