import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import ImageNode from '@/components/shared/advancedEditor/blocks/imageNode/ImageNode.vue';

export const ResizableImage = Node.create({
  name: 'resizableImage',
  
  group: 'block',
  
  inline: false,
  
  draggable: true,

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
        default: '100%',
      },
      height: {
        default: 'auto',
      },
    }
  },
  
  parseHTML() {
    return [
      {
        tag: 'img[src]',
      },
    ]
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(HTMLAttributes)]
  },
  
  addCommands() {
    return {
      setImage: options => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        })
      },
    }
  },
  
  addNodeView() {
    return VueNodeViewRenderer(ImageNode)
  },
})

export default ResizableImage;
