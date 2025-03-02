import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import { Decoration, DecorationSet } from 'prosemirror-view'
import TableNodeView from '@/components/shared/advancedEditor/blocks/table/TableNodeView.vue'

export default Extension.create({
  name: 'stripedTable',

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'striped-table',
      },
      // Default Tailwind classes
      defaultTableClasses: 'w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400',
      defaultTheadClasses: 'text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400',
      defaultTrClasses: 'bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200',
      stripedTrClasses: 'odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200',
      defaultThClasses: 'px-6 py-3',
      defaultTdClasses: 'px-6 py-4',
      defaultThRowClasses: 'px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white',
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: ['table'],
        attributes: {
          striped: {
            default: false,
            parseHTML: element => element.hasAttribute('data-striped'),
            renderHTML: attributes => {
              const attrs = { 'class': this.options.defaultTableClasses }
              
              if (attributes.striped) {
                return {
                  ...attrs,
                  'data-striped': 'true',
                }
              }
              
              return attrs
            },
          },
        },
      },
      {
        types: ['tableHeader'],
        attributes: {
          defaultClasses: {
            default: true,
            renderHTML: () => ({
              'class': this.options.defaultTheadClasses,
            }),
          },
        },
      },
      {
        types: ['tableRow'],
        attributes: {
          defaultClasses: {
            default: true,
            renderHTML: () => ({
              'class': this.options.defaultTrClasses,
            }),
          },
        },
      },
      {
        types: ['tableCell'],
        attributes: {
          defaultClasses: {
            default: true,
            renderHTML: attributes => {
              if (attributes.isHeader) {
                return {
                  'class': this.options.defaultThClasses,
                  'scope': 'col',
                }
              }
              return {
                'class': this.options.defaultTdClasses,
              }
            },
          },
        },
      },
      {
        types: ['tableHeaderCell'],
        attributes: {
          defaultClasses: {
            default: true,
            renderHTML: () => ({
              'class': this.options.defaultThClasses,
              'scope': 'col',
            }),
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      toggleTableStriped: () => ({ tr, state, dispatch }) => {
        // Find if there's a table node selected or near the current selection
        const { selection } = state
        const { $from } = selection
        
        // Find the closest table node and its position
        let tableNode = null
        let pos = null
        
        for (let depth = $from.depth; depth > 0; depth--) {
          const node = $from.node(depth)
          if (node.type.name === 'table') {
            tableNode = node
            pos = $from.before(depth)
            break
          }
        }
        
        if (tableNode && pos !== null && dispatch) {
          // Toggle the striped attribute
          const isStriped = tableNode.attrs.striped
          
          // Create the transaction to update the table's attributes
          tr.setNodeMarkup(pos, undefined, {
            ...tableNode.attrs,
            striped: !isStriped
          })
          
          dispatch(tr)
          return true
        }
        
        return false
      },
      
      setTableStriped: (striped) => ({ tr, state, dispatch }) => {
        const { selection } = state
        const { $from } = selection
        
        // Find the closest table node and its position
        let tableNode = null
        let pos = null
        
        for (let depth = $from.depth; depth > 0; depth--) {
          const node = $from.node(depth)
          if (node.type.name === 'table') {
            tableNode = node
            pos = $from.before(depth)
            break
          }
        }
        
        if (tableNode && pos !== null && dispatch) {
          // Create the transaction to update the table's attributes
          tr.setNodeMarkup(pos, undefined, {
            ...tableNode.attrs,
            striped
          })
          
          dispatch(tr)
          return true
        }
        
        return false
      },
      
      addElementAfterTable: (elementType) => ({ tr, state, dispatch }) => {
        const { selection } = state
        const { $from } = selection
        
        // Find the closest table node and its position
        let tableNode = null
        let tablePos = null
        
        for (let depth = $from.depth; depth > 0; depth--) {
          const node = $from.node(depth)
          if (node.type.name === 'table') {
            tableNode = node
            tablePos = $from.before(depth)
            break
          }
        }
        
        if (tableNode && tablePos !== null && dispatch) {
          // Find the end position of the table
          const tableEndPos = tablePos + tableNode.nodeSize
          
          // Get the node type for the element to insert
          const nodeType = state.schema.nodes[elementType]
          
          if (!nodeType) {
            return false
          }
          
          // Insert the new node after the table
          tr.insert(tableEndPos, nodeType.create())
          
          // Set selection to the new node
          const resolvedPos = tr.doc.resolve(tableEndPos + 1)
          tr.setSelection(state.selection.constructor.near(resolvedPos))
          
          dispatch(tr)
          return true
        }
        
        return false
      }
    }
  },

  // Optional: Add keyboard shortcut to toggle striped table
  addKeyboardShortcuts() {
    return {
      'Mod-Alt-s': () => this.editor.commands.toggleTableStriped(),
    }
  },
  
  // Add plugins to detect selected tables and enhance table interaction
  addProseMirrorPlugins() {
    const pluginKey = new PluginKey('stripedTablePlugin')
    
    return [
      new Plugin({
        key: pluginKey,
        
        // Track table selection state
        state: {
          init() {
            return {
              selectedTable: null,
              selectedCell: null,
              selectedRow: null,
              selectedColumn: null,
            }
          },
          
          apply(tr, value, oldState, newState) {
            const { selection } = newState
            let tablePos = null
            let cellPos = null
            let rowPos = null
            let columnIndex = -1
            
            // Try to find if selection is inside a table
            if (selection.$anchor) {
              const $pos = selection.$anchor
              
              // Find table position by iterating through ancestors
              for (let i = $pos.depth; i > 0; i--) {
                const node = $pos.node(i)
                if (node.type.name === 'table') {
                  tablePos = $pos.before(i)
                } else if (node.type.name === 'tableRow') {
                  rowPos = $pos.before(i)
                } else if (node.type.name === 'tableCell' || node.type.name === 'tableHeader') {
                  cellPos = $pos.before(i)
                  
                  // Try to determine column index
                  if (rowPos !== null) {
                    const rowNode = $pos.node($pos.depth - 1)
                    if (rowNode && rowNode.childCount) {
                      // Calculate column index based on cell position
                      for (let j = 0; j < rowNode.childCount; j++) {
                        const childPos = rowPos + 1 // Start after row start token
                        
                        if (childPos === cellPos) {
                          columnIndex = j
                          break
                        }
                        
                        // Move to next cell
                        const cellNode = rowNode.child(j)
                        if (cellNode) {
                          childPos += cellNode.nodeSize
                        }
                      }
                    }
                  }
                }
              }
            }
            
            return {
              selectedTable: tablePos,
              selectedCell: cellPos,
              selectedRow: rowPos,
              selectedColumn: columnIndex
            }
          }
        },
        
        // Add selection-specific classes for visual feedback
        props: {
          decorations: (state) => {
            const { doc } = state
            const pluginState = pluginKey.getState(state)
            if (!pluginState.selectedTable) return null
            
            const decorations = []
            
            // Highlight selected row if applicable
            if (pluginState.selectedRow !== null) {
              decorations.push(
                Decoration.node(pluginState.selectedRow, pluginState.selectedRow + 1, {
                  class: 'selected-table-row'
                })
              )
            }
            
            // Highlight selected cell if applicable
            if (pluginState.selectedCell !== null) {
              decorations.push(
                Decoration.node(pluginState.selectedCell, pluginState.selectedCell + 1, {
                  class: 'selected-table-cell'
                })
              )
            }
            
            return DecorationSet.create(doc, decorations)
          }
        }
      })
    ]
  },
  
  // Add custom node view for table using Vue component
  addNodeView() {
    return (props) => {
      // Determine if this is a top-level table or nested
      const { node, editor, getPos } = props;
      let isNested = false;
      
      if (typeof getPos === 'function') {
        try {
          const pos = getPos();
          const $pos = editor?.view.state.doc.resolve(pos);
          
          // If depth > 1, it's nested inside another element
          if ($pos && $pos.depth > 1) {
            isNested = true;
          }
        } catch (e) {
          console.error('Error determining table nesting:', e);
        }
      }
      
      // If it's nested, use the default node view without wrapper controls
      //if (isNested) {
      //  // Create a table element to hold content
      //  const table = document.createElement('table')
      //  table.classList.add(this.options.defaultTableClasses)
      //  
      //  // Apply striped attribute if set
      //  if (node.attrs.striped) {
      //    table.setAttribute('data-striped', 'true')
      //  }
      //  
      //  // Use existing HTML content of the table
      //  table.appendChild(document.createRange().createContextualFragment(node.content.toHTML()))
      //  
      //  // Return simple DOM node view without wrapper
      //  return {
      //    dom: table,
      //    contentDOM: table,
      //    update: (updatedNode) => {
      //      if (updatedNode.type.name !== 'table') return false;
      //      
      //      // Update striped attribute if needed
      //      if (updatedNode.attrs.striped) {
      //        table.setAttribute('data-striped', 'true');
      //      } else {
      //        table.removeAttribute('data-striped');
      //      }
      //      
      //      return true;
      //    }
      //  };
      //}
      
      // For top-level tables, use our custom node view with BaseContainer wrapper
      return VueNodeViewRenderer(TableNodeView)(props);
    }
  }
})
