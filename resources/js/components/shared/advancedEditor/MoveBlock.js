import { Extension } from '@tiptap/core'
import { TextSelection } from '@tiptap/pm/state'

export const MoveNode = Extension.create({
  name: 'moveNode',

  addCommands() {
    return {
      moveNodeUp: () => ({ editor, state, dispatch }) => {
        // Get the current selection
        const { $from, $to } = state.selection
        
        // Find the top-level node that contains the selection
        const depth = $from.depth
        const startPos = depth > 0 ? $from.before(1) : $from.pos
        const endPos = depth > 0 ? $to.after(1) : $to.pos
        const nodeSize = endPos - startPos
        
        // Find the position of the node before it
        const nodeBefore = startPos > 0 ? state.doc.resolve(startPos - 1).before(1) : null
        
        // If there's no node before, we can't move up
        if (nodeBefore === null) return false
        
        // Get the position and size of the node before
        const nodeBeforeStart = state.doc.resolve(nodeBefore).pos
        const nodeBeforeEnd = nodeBeforeStart + state.doc.nodeAt(nodeBeforeStart).nodeSize
        const nodeBeforeSize = nodeBeforeEnd - nodeBeforeStart
        
        if (dispatch) {
          // Create a new transaction
          const tr = state.tr
          
          // Delete the current node and insert it before the previous node
          const nodeContent = state.doc.slice(startPos, endPos)
          tr.delete(startPos, endPos)
          tr.insert(nodeBeforeStart, nodeContent.content)
          
          // Set selection to the moved node
          const newPos = nodeBeforeStart + 1
          tr.setSelection(TextSelection.create(tr.doc, newPos))
          
          // Apply the transaction
          dispatch(tr)
        }
        
        return true
      },
      
      moveNodeDown: () => ({ editor, state, dispatch }) => {
        // Get the current selection
        const { $from, $to } = state.selection
        
        // Find the top-level node that contains the selection
        const depth = $from.depth
        const startPos = depth > 0 ? $from.before(1) : $from.pos
        const endPos = depth > 0 ? $to.after(1) : $to.pos
        const nodeSize = endPos - startPos
        
        // Find the position of the node after it
        const nodeAfter = endPos < state.doc.content.size ? state.doc.resolve(endPos).after(1) : null
        
        // If there's no node after, we can't move down
        if (nodeAfter === null) return false
        
        // Get the position and size of the node after
        const nodeAfterStart = state.doc.resolve(nodeAfter).pos
        const nodeAfterEnd = nodeAfterStart + state.doc.nodeAt(nodeAfterStart).nodeSize
        const nodeAfterSize = nodeAfterEnd - nodeAfterStart
        
        if (dispatch) {
          // Create a new transaction
          const tr = state.tr
          
          // Delete the current node
          const nodeContent = state.doc.slice(startPos, endPos)
          tr.delete(startPos, endPos)
          
          // Insert it after the next node
          tr.insert(nodeAfterEnd - (endPos - startPos), nodeContent.content)
          
          // Set selection to the moved node
          const newPos = nodeAfterEnd - nodeSize + 1
          tr.setSelection(TextSelection.create(tr.doc, newPos))
          
          // Apply the transaction
          dispatch(tr)
        }
        
        return true
      }
    }
  },

  addKeyboardShortcuts() {
    return {
      'Alt-ArrowUp': () => this.editor.commands.moveNodeUp(),
      'Alt-ArrowDown': () => this.editor.commands.moveNodeDown()
    }
  }
})

// Usage example:
// 
// import { Editor } from '@tiptap/core'
// import StarterKit from '@tiptap/starter-kit'
// import { MoveNode } from './move-node'
// 
// const editor = new Editor({
//   element: document.querySelector('.editor'),
//   extensions: [
//     StarterKit,
//     MoveNode,
//   ],
//   content: '<p>Hello World</p>',
// })
// 
// // You can now use keyboard shortcuts Alt+↑ and Alt+↓ to move nodes
// // Or programmatically:
// // editor.commands.moveNodeUp()
// // editor.commands.moveNodeDown()
