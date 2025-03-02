import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'

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
      }
    }
  },

  // Optional: Add keyboard shortcut to toggle striped table
  addKeyboardShortcuts() {
    return {
      'Mod-Alt-s': () => this.editor.commands.toggleTableStriped(),
    }
  },
  
  // Add plugins to detect selected tables
  addProseMirrorPlugins() {
    const pluginKey = new PluginKey('stripedTablePlugin')
    
    return [
      new Plugin({
        key: pluginKey,
        // Additional plugin functionality could be added here if needed
      })
    ]
  }
})
