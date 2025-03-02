// useElementFocus.js
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

/**
 * A composable to track if a TipTap node is currently focused
 * 
 * @param {Object} props - Node view props from TipTap
 * @returns {Object} - An object containing the isFocused ref
 */
export function useElementFocus(props) {
  // Internal focus state tracking
  const isFocused = ref(false)
  
  // Function to check if this node is currently focused
  const checkIsFocused = () => {
    if (!props.editor) return false
    
    const { state } = props.editor
    const { selection } = state
    const pos = props.getPos()
    
    // If getPos is a function or undefined, we can't determine position
    if (typeof pos === 'function' || pos === undefined) return false
    
    // Calculate node boundaries
    const nodeStart = pos
    const nodeEnd = pos + props.node.nodeSize
    
    // Node is focused if selection is inside it
    return selection.from >= nodeStart && selection.to <= nodeEnd
  }
  
  // Update focus state whenever selection changes
  const updateFocusState = () => {
    isFocused.value = checkIsFocused()
  }
  
  // Set up event listeners
  onMounted(() => {
    if (props.editor) {
      props.editor.on('selectionUpdate', updateFocusState)
      props.editor.on('focus', updateFocusState)
      
      // Initial check
      updateFocusState()
    }
  })
  
  // Clean up event listeners
  onBeforeUnmount(() => {
    if (props.editor) {
      props.editor.off('selectionUpdate', updateFocusState)
      props.editor.off('focus', updateFocusState)
    }
  })
  
  // Watch for selection prop changes as backup
  watch(() => props.selected, updateFocusState)
  
  // Return the focus state
  return {
    isFocused
  }
}
