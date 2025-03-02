import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

// Create a unique key for our plugin
const nodeWrapperPluginKey = new PluginKey('nodeWrapper');

// Helper function to create action button DOM elements
const createActionButton = (icon, title, className, onClick) => {
  const button = document.createElement('button');
  button.className = `node-wrapper-action ${className}`;
  button.setAttribute('title', title);
  button.innerHTML = icon;
  button.addEventListener('click', onClick);
  return button;
};

// Helper to determine if a node is a valid block for our wrapper
const isValidNode = (node) => {
  // Don't wrap these node types
  const excludedTypes = ['doc'];
  
  // Only wrap block nodes
  return node.isBlock && !excludedTypes.includes(node.type.name);
};

export const NodeWrapper = Extension.create({
  name: 'nodeWrapper',

  addOptions() {
    return {
      // Classes for the wrapper
      wrapperClass: 'node-wrapper',
      // Show wrapper only on hover or always
      alwaysShow: false,
    };
  },

  addCommands() {
    return {
      // Move the selected node up
      moveNodeUp: () => ({ state, dispatch }) => {
        const { selection } = state;
        const { from } = selection;
        
        // Find the current node
        let currentNode = null;
        let currentPos = null;
        let previousPos = null;
        
        state.doc.nodesBetween(from, from, (node, pos, parent, index) => {
          if (isValidNode(node) && !currentNode) {
            currentNode = node;
            currentPos = pos;
            
            // Find the previous sibling's position
            if (index > 0) {
              let prevIndex = index - 1;
              let prevNodeSize = 0;
              
              // Skip until we find a valid node
              while (prevIndex >= 0) {
                const prevNode = parent.child(prevIndex);
                if (isValidNode(prevNode)) {
                  previousPos = pos - prevNodeSize - prevNode.nodeSize;
                  break;
                }
                prevNodeSize += prevNode.nodeSize;
                prevIndex--;
              }
            }
            return false;
          }
          return true;
        });
        
        // If we found a current node and previous sibling
        if (currentNode && currentPos !== null && previousPos !== null) {
          if (dispatch) {
            const tr = state.tr;
            
            // Create a copy of the node to move
            const nodeToMove = currentNode;
            
            // Delete the original node
            tr.delete(currentPos, currentPos + nodeToMove.nodeSize);
            
            // Insert the node at the new position
            tr.insert(previousPos, nodeToMove);
            
            // Set selection to the moved node
            const newPos = previousPos;
            tr.setSelection(state.selection.constructor.near(
              tr.doc.resolve(newPos)
            ));
            
            dispatch(tr);
          }
          return true;
        }
        
        return false;
      },
      
      // Move the selected node down
      moveNodeDown: () => ({ state, dispatch }) => {
        const { selection } = state;
        const { from } = selection;
        
        // Find the current node
        let currentNode = null;
        let currentPos = null;
        let nextPos = null;
        
        state.doc.nodesBetween(from, from, (node, pos, parent, index) => {
          if (isValidNode(node) && !currentNode) {
            currentNode = node;
            currentPos = pos;
            
            // Find the next sibling's position
            if (index < parent.childCount - 1) {
              let nextIndex = index + 1;
              
              // Skip until we find a valid node
              while (nextIndex < parent.childCount) {
                const nextNode = parent.child(nextIndex);
                if (isValidNode(nextNode)) {
                  nextPos = pos + node.nodeSize;
                  break;
                }
                nextIndex++;
              }
            }
            return false;
          }
          return true;
        });
        
        // If we found a current node and next sibling
        if (currentNode && currentPos !== null && nextPos !== null) {
          if (dispatch) {
            const tr = state.tr;
            
            // Find the next node
            let nextNode = null;
            let nextNodeSize = 0;
            
            state.doc.nodesBetween(nextPos, nextPos + 1, (node, pos) => {
              if (isValidNode(node) && !nextNode) {
                nextNode = node;
                nextNodeSize = node.nodeSize;
                return false;
              }
              return true;
            });
            
            if (nextNode) {
              // Create copies of the nodes to move
              const nodeToMove = currentNode;
              
              // Delete the current node
              tr.delete(currentPos, currentPos + nodeToMove.nodeSize);
              
              // Insert the node after the next node
              tr.insert(nextPos + nextNodeSize - nodeToMove.nodeSize, nodeToMove);
              
              // Set selection to the moved node
              const newPos = nextPos + nextNodeSize - nodeToMove.nodeSize;
              tr.setSelection(state.selection.constructor.near(
                tr.doc.resolve(newPos)
              ));
              
              dispatch(tr);
            }
          }
          return true;
        }
        
        return false;
      },
      
      // Delete the selected node
      deleteNode: () => ({ state, dispatch }) => {
        const { selection } = state;
        const { from } = selection;
        
        // Find the current node
        let currentNode = null;
        let currentPos = null;
        
        state.doc.nodesBetween(from, from, (node, pos, parent, index) => {
          if (isValidNode(node) && !currentNode) {
            currentNode = node;
            currentPos = pos;
            return false;
          }
          return true;
        });
        
        // If we found a node to delete
        if (currentNode && currentPos !== null) {
          if (dispatch) {
            const tr = state.tr;
            
            // Delete the node
            tr.delete(currentPos, currentPos + currentNode.nodeSize);
            
            // Set selection to the previous node or parent
            const resolvedPos = tr.doc.resolve(Math.max(currentPos - 1, 0));
            tr.setSelection(state.selection.constructor.near(resolvedPos));
            
            dispatch(tr);
          }
          return true;
        }
        
        return false;
      },
    };
  },

  addProseMirrorPlugins() {
    const { wrapperClass, alwaysShow } = this.options;
    
    return [
      new Plugin({
        key: nodeWrapperPluginKey,
        state: {
          init() {
            return {
              hoverPos: null,
              activePos: null,
            };
          },
          apply(tr, prev) {
            const { hoverPos, activePos } = prev;
            return { hoverPos, activePos };
          },
        },
        props: {
          handleDOMEvents: {
            mouseover(view, event) {
              const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
              if (!pos) return false;
              
              const { doc } = view.state;
              let hoveredNode = null;
              let hoveredPos = null;
              
              doc.nodesBetween(pos.pos, pos.pos, (node, nodePos) => {
                if (isValidNode(node)) {
                  hoveredNode = node;
                  hoveredPos = nodePos;
                  return false;
                }
                return true;
              });
              
              const pluginState = nodeWrapperPluginKey.getState(view.state);
              
              if (hoveredPos !== pluginState.hoverPos) {
                pluginState.hoverPos = hoveredPos;
                view.dispatch(view.state.tr.setMeta(nodeWrapperPluginKey, { 
                  type: 'hover', 
                  pos: hoveredPos 
                }));
              }
              
              return false;
            },
            
            mouseout(view, event) {
              const pluginState = nodeWrapperPluginKey.getState(view.state);
              
              if (!event.relatedTarget || !view.dom.contains(event.relatedTarget)) {
                if (pluginState.hoverPos !== null) {
                  pluginState.hoverPos = null;
                  view.dispatch(view.state.tr.setMeta(nodeWrapperPluginKey, { 
                    type: 'hover', 
                    pos: null 
                  }));
                }
              }
              
              return false;
            },
            
            click(view, event) {
              // Check if clicking a wrapper action button
              const actionButton = event.target.closest('.node-wrapper-action');
              if (!actionButton) return false;
              
              event.preventDefault();
              event.stopPropagation();
              
              const { doc } = view.state;
              const pos = parseInt(actionButton.getAttribute('data-pos'), 10);
              
              if (isNaN(pos)) return false;
              
              // Handle different actions
              if (actionButton.classList.contains('move-up')) {
                view.dispatch(view.state.tr.setSelection(
                  view.state.selection.constructor.near(doc.resolve(pos))
                ));
                this.options.moveNodeUp({ state: view.state, dispatch: view.dispatch });
              } else if (actionButton.classList.contains('move-down')) {
                view.dispatch(view.state.tr.setSelection(
                  view.state.selection.constructor.near(doc.resolve(pos))
                ));
                this.options.moveNodeDown({ state: view.state, dispatch: view.dispatch });
              } else if (actionButton.classList.contains('delete')) {
                view.dispatch(view.state.tr.setSelection(
                  view.state.selection.constructor.near(doc.resolve(pos))
                ));
                this.options.deleteNode({ state: view.state, dispatch: view.dispatch });
              }
              
              return true;
            },
          },
          
          decorations(state) {
            const { doc, selection } = state;
            const pluginState = this.getState(state);
            const decorations = [];
            
            // Helper to add node decorations with wrapper and actions
            const addNodeDecoration = (node, pos) => {
              // Create action buttons
              const moveUpIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>';
              const moveDownIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';
              const deleteIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>';
              
              const moveUpButton = createActionButton(
                moveUpIcon, 
                'Move Up', 
                'move-up',
                () => {}
              );
              moveUpButton.setAttribute('data-pos', pos);
              
              const moveDownButton = createActionButton(
                moveDownIcon, 
                'Move Down', 
                'move-down',
                () => {}
              );
              moveDownButton.setAttribute('data-pos', pos);
              
              const deleteButton = createActionButton(
                deleteIcon, 
                'Delete', 
                'delete',
                () => {}
              );
              deleteButton.setAttribute('data-pos', pos);
              
              // Create the wrapper
              const wrapper = document.createElement('div');
              wrapper.className = wrapperClass;
              
              // Create the action container
              const actionContainer = document.createElement('div');
              actionContainer.className = 'node-wrapper-actions';
              
              // Add buttons to action container
              actionContainer.appendChild(moveUpButton);
              actionContainer.appendChild(moveDownButton);
              actionContainer.appendChild(deleteButton);
              
              // Add the wrapper element with action buttons
              decorations.push(
                Decoration.node(
                  pos, 
                  pos + node.nodeSize, 
                  { 
                    class: `${wrapperClass} ${node.type.name}-wrapper`,
                    'data-type': node.type.name
                  },
                  {
                    wrapper,
                    actionContainer
                  }
                )
              );
            };
            
            // Add decorations based on selection and hover
            if (alwaysShow) {
              // Add wrappers to all valid nodes
              doc.descendants((node, pos) => {
                if (isValidNode(node)) {
                  addNodeDecoration(node, pos);
                }
                return true;
              });
            } else {
              // Add wrapper to hovered node
              if (pluginState.hoverPos !== null) {
                doc.nodesBetween(pluginState.hoverPos, pluginState.hoverPos + 1, (node, pos) => {
                  if (isValidNode(node)) {
                    addNodeDecoration(node, pos);
                    return false;
                  }
                  return true;
                });
              }
              
              // Add wrapper to selected node
              if (selection.from === selection.to) {
                const { from } = selection;
                doc.nodesBetween(from, from + 1, (node, pos) => {
                  if (isValidNode(node) && pos !== pluginState.hoverPos) {
                    addNodeDecoration(node, pos);
                    return false;
                  }
                  return true;
                });
              }
            }
            
            return DecorationSet.create(doc, decorations);
          }
        }
      })
    ];
  }
});

export default NodeWrapper;
