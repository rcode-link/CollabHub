import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'

/**
 * Tiptap Extension that ensures there's always at least one paragraph in the document
 * and adds a paragraph after any newly added content.
 */
export default Extension.create({
  name: 'ensureParagraph',

  // Configure default options
  addOptions() {
    return {
      // You can customize this to be any node type that should always be present
      defaultType: 'paragraph',
    }
  },

  // Add the plugin to the editor
  addProseMirrorPlugins() {
    const { defaultType } = this.options
    
    return [
      new Plugin({
        key: new PluginKey('ensureParagraph'),
        
        // This runs after each transaction (edit) to the document
        appendTransaction(transactions, oldState, newState) {
          // Skip if there were no transactions or if none changed the doc
          if (!transactions.some(tr => tr.docChanged)) return null
          
          const { doc, schema, tr } = newState
          const paragraphType = schema.nodes[defaultType]
          
          if (!paragraphType) {
            console.warn(`The node type "${defaultType}" doesn't exist in the schema.`)
            return null
          }
          
          // Check if there's at least one paragraph in the document
          let hasParagraph = false
          
          doc.descendants((node) => {
            if (node.type === paragraphType) {
              hasParagraph = true
              return false // Stop traversal
            }
            return true // Continue traversal
          })
          
          // If the document is completely empty, add a paragraph
          if (doc.childCount === 0) {
            return tr.insert(0, paragraphType.create())
          }
          
          // If no paragraph found, add one at the end
          if (!hasParagraph) {
            return tr.insert(doc.content.size, paragraphType.create())
          }
          
          // Always add a paragraph at the end if the last node is not a paragraph
          const lastChild = doc.lastChild
          if (lastChild && lastChild.type !== paragraphType) {
            return tr.insert(doc.content.size, paragraphType.create())
          }
          
          return null
        },
      }),
    ]
  },
})
