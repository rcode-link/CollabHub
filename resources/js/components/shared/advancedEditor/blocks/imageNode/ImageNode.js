import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import ImageNodeView from './ImageNode.vue'

export const ImageNode = Node.create({
  name: 'customImage',
  
  group: 'block',
  
  draggable: true,
  
  inline: false,
  
  // Define the allowed attributes with defaults
  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: null,
      },
      height: {
        default: null,
      },
      // Additional custom attributes for our node view
      alignment: {
        default: 'center',
        parseHTML: element => element.getAttribute('data-alignment') || 'center',
        renderHTML: attributes => {
          if (!attributes.alignment) {
            return {}
          }
          return {
            'data-alignment': attributes.alignment,
          }
        },
      },
      size: {
        default: 'medium',
        parseHTML: element => element.getAttribute('data-size') || 'medium',
        renderHTML: attributes => {
          if (!attributes.size) {
            return {}
          }
          return {
            'data-size': attributes.size,
          }
        },
      },
    }
  },
  
  parseHTML() {
    return [
      {
        tag: 'div[data-type="custom-image"]',
      },
    ]
  },
  
  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(
        { 'data-type': 'custom-image' },
        HTMLAttributes,
      ),
      ['img', {
        src: HTMLAttributes.src,
        alt: HTMLAttributes.alt,
        title: HTMLAttributes.title,
      }]
    ]
  },
  
  addNodeView() {
    return VueNodeViewRenderer(ImageNodeView)
  },
  
  addCommands() {
    return {
      setCustomImage: options => ({ chain }) => {
        return chain()
          .insertContent({
            type: this.name,
            attrs: options,
          })
          .run()
      },
      
      updateImageAttributes: attributes => ({ chain, state }) => {
        const { selection } = state
        const pos = selection.$anchor.before()
        
        return chain()
          .command(({ tr }) => {
            tr.setNodeMarkup(pos, undefined, {
              ...tr.doc.nodeAt(pos).attrs,
              ...attributes,
            })
            
            return true
          })
          .run()
      },
    }
  },
})

export default ImageNode
