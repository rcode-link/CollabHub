import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'
import { Decoration, DecorationSet } from 'prosemirror-view'

export default Extension.create({
  name: 'clickedElementDecoration',

  // Add options for customization
  addOptions() {
    return {
      // CSS classes to add to the clicked element
      decorationClass: 'element-clicked-decoration',
      // Custom style to apply (can be overridden by user)
      decorationStyle: 'box-shadow: 0 0 0 2px #5abbf7; border-radius: 4px;',
    }
  },

  // Add additional attributes
  addGlobalAttributes() {
    return [
      {
        types: ['*'], // Apply to all node types
        attributes: {
          clicked: {
            default: false,
            parseHTML: element => element.getAttribute('data-clicked') === 'true',
            renderHTML: attributes => {
              if (!attributes.clicked) {
                return {}
              }

              return {
                'data-clicked': 'true',
              }
            },
          },
        },
      },
    ]
  },

  // Add custom CSS styles
  addProseMirrorPlugins() {
    const { decorationClass, decorationStyle } = this.options

    return [
      new Plugin({
        key: new PluginKey('clickedElementDecoration'),
        props: {
          // Add custom CSS to the editor
          decorations(state) {
            const decorations = []
            const { doc, selection } = state

            // Function to create a decoration
            const createDecoration = (from, to) => {
              return Decoration.inline(from, to, {
                class: decorationClass,
                style: decorationStyle,
              })
            }

            // Handle click events and create decorations
            doc.descendants((node, pos) => {
              if (node.attrs.clicked) {
                decorations.push(createDecoration(pos, pos + node.nodeSize))
              }
            })

            return DecorationSet.create(doc, decorations)
          },

          // Handle click events
          handleClick(view, pos, event) {
            const { state, dispatch } = view
            const { tr } = state
            
            // Get the node at the clicked position
            const node = state.doc.nodeAt(pos)
            if (!node) return false

            // Find the node's position range
            let from = pos
            let to = pos + node.nodeSize
            
            // Toggle the clicked attribute
            const isClicked = node.attrs.clicked === true
            tr.setNodeMarkup(from, null, { 
              ...node.attrs,
              clicked: !isClicked
            })

            // Apply the transaction
            dispatch(tr)
            
            // Return true to indicate we've handled the click
            return true
          },
        },
      }),
    ]
  },
})

