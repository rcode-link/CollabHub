// Create a custom block node type that can use your node view
// blocks/customBlock/CustomBlock.js

import { Node } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import CustomNodeView from './CustomNodeView.vue'

export const CustomBlock = Node.create({
  name: 'customBlock',
  
  group: 'block',
  
  content: 'block+',
  
  draggable: true,
  
  parseHTML() {
    return [
      {
        tag: 'div[data-type="custom-block"]',
      },
    ]
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-type': 'custom-block', ...HTMLAttributes }, 0]
  },
  
  addNodeView() {
    return VueNodeViewRenderer(CustomNodeView)
  },
  
  addCommands() {
    return {
      setCustomBlock: content => ({ chain }) => {
        return chain()
          .insertContent({
            type: this.name,
            content,
          })
          .run()
      },
    }
  },
})

export default CustomBlock;
