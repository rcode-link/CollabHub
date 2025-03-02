<template>
  <node-view-wrapper
    class="image-node"
    :class="[
      `image-align-${node.attrs.alignment}`,
      `image-size-${node.attrs.size}`,
      { 'is-selected': selected }
    ]"
  >
    <!-- Node Controls -->
    <div class="node-controls" data-drag-handle>
      <button
        class="control-btn move-up-btn"
        @click.stop="moveUp"
        title="Move Up"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
          <path fill="none" stroke="currentColor" stroke-width="2" d="m18 15-6-6-6 6"/>
        </svg>
      </button>

      <button
        class="control-btn move-down-btn"
        @click.stop="moveDown"
        title="Move Down"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
          <path fill="none" stroke="currentColor" stroke-width="2" d="m6 9 6 6 6-6"/>
        </svg>
      </button>

      <button
        class="control-btn delete-btn"
        @click.stop="removeNode"
        title="Delete"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
          <path fill="none" stroke="currentColor" stroke-width="2" d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2m-6 5v6m4-6v6"/>
        </svg>
      </button>
    </div>

    <!-- Image-specific controls -->
    <div class="image-controls">
      <!-- Size controls -->
      <div class="image-size-controls">
        <button
          class="size-btn"
          :class="{ active: node.attrs.size === 'small' }"
          @click="updateSize('small')"
          title="Small"
        >
          S
        </button>
        <button
          class="size-btn"
          :class="{ active: node.attrs.size === 'medium' }"
          @click="updateSize('medium')"
          title="Medium"
        >
          M
        </button>
        <button
          class="size-btn"
          :class="{ active: node.attrs.size === 'large' }"
          @click="updateSize('large')"
          title="Large"
        >
          L
        </button>
      </div>

      <!-- Alignment controls -->
      <div class="image-alignment-controls">
        <button
          class="align-btn"
          :class="{ active: node.attrs.alignment === 'left' }"
          @click="updateAlignment('left')"
          title="Align Left"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
            <path fill="none" stroke="currentColor" stroke-width="2" d="M4 6h16M4 12h10M4 18h16"/>
          </svg>
        </button>
        <button
          class="align-btn"
          :class="{ active: node.attrs.alignment === 'center' }"
          @click="updateAlignment('center')"
          title="Align Center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
            <path fill="none" stroke="currentColor" stroke-width="2" d="M4 6h16M7 12h10M4 18h16"/>
          </svg>
        </button>
        <button
          class="align-btn"
          :class="{ active: node.attrs.alignment === 'right' }"
          @click="updateAlignment('right')"
          title="Align Right"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
            <path fill="none" stroke="currentColor" stroke-width="2" d="M4 6h16M10 12h10M4 18h16"/>
          </svg>
        </button>
      </div>

      <!-- Replace image button -->
      <button
        class="replace-btn"
        @click="openFileInput"
        title="Replace Image"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
          <path fill="none" stroke="currentColor" stroke-width="2" d="M15 8h.01M12 3c7.2 0 9 1.8 9 9s-1.8 9-9 9s-9-1.8-9-9s1.8-9 9-9zM16.5 14.5L12 21m0 0l-4.5-6.5M12 21V12"/>
        </svg>
      </button>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="hidden-input"
        @change="onFileSelected"
      />
    </div>

    <!-- Image content -->
    <div class="image-wrapper">
      <img
        :src="node.attrs.src"
        :alt="node.attrs.alt || ''"
        :title="node.attrs.title || ''"
      />
    </div>

    <!-- Optional caption for the image -->
    <div v-if="node.attrs.alt" class="image-caption">
      {{ node.attrs.alt }}
    </div>
  </node-view-wrapper>
</template>

<script>
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3'

export default {
  components: {
    NodeViewWrapper,
  },

  props: nodeViewProps,

  data() {
    return {
      // Add any local state here
    }
  },

  methods: {
    moveUp() {
      // Use the editor's command chain to move the node up
      this.editor.chain().focus().command(({ tr }) => {
        const { selection } = this.editor.state
        const pos = this.getPos()

        // Find the previous node position
        let prevPos = null
        this.editor.state.doc.nodesBetween(0, pos, (node, nodePos) => {
          if (nodePos < pos && node.type.name === this.node.type.name) {
            prevPos = nodePos
          }
        })

        if (prevPos !== null) {
          // Calculate node sizes
          const currentNode = this.editor.state.doc.nodeAt(pos)
          const prevNode = this.editor.state.doc.nodeAt(prevPos)

          if (currentNode && prevNode) {
            // Swap the nodes
            tr.delete(pos, pos + currentNode.nodeSize)
            tr.delete(prevPos, prevPos + prevNode.nodeSize)

            tr.insert(prevPos, currentNode)
            tr.insert(prevPos + currentNode.nodeSize, prevNode)

            return true
          }
        }

        return false
      }).run()
    },

    moveDown() {
      // Use the editor's command chain to move the node down
      this.editor.chain().focus().command(({ tr }) => {
        const pos = this.getPos()
        const currentNode = this.editor.state.doc.nodeAt(pos)

        if (!currentNode) return false

        const currentNodeSize = currentNode.nodeSize
        const endPos = pos + currentNodeSize

        // Find the next node position
        let nextPos = null
        this.editor.state.doc.nodesBetween(endPos, this.editor.state.doc.content.size, (node, nodePos) => {
          if (nodePos > pos && node.type.name === this.node.type.name && nextPos === null) {
            nextPos = nodePos
            return false
          }
          return true
        })

        if (nextPos !== null) {
          // Calculate node sizes
          const nextNode = this.editor.state.doc.nodeAt(nextPos)

          if (currentNode && nextNode) {
            // Swap the nodes
            tr.delete(nextPos, nextPos + nextNode.nodeSize)
            tr.delete(pos, pos + currentNodeSize)

            tr.insert(pos, nextNode)
            tr.insert(pos + nextNode.nodeSize, currentNode)

            return true
          }
        }

        return false
      }).run()
    },

    removeNode() {
      this.deleteNode()
    },

    updateSize(size) {
      this.updateAttributes({
        size,
      })
    },

    updateAlignment(alignment) {
      this.updateAttributes({
        alignment,
      })
    },

    openFileInput() {
      this.$refs.fileInput.click()
    },

    onFileSelected(event) {
      const file = event.target.files[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (e) => {
        this.updateAttributes({
          src: e.target.result,
        })
      }
      reader.readAsDataURL(file)

      // Reset the file input
      this.$refs.fileInput.value = ''
    }
  }
}
</script>

<style>
.image-node {
  position: relative;
  margin: 1.5rem 0;
  transition: all 0.2s ease;
}

.image-node.is-selected {
  box-shadow: 0 0 0 2px #3b82f6;
}

.image-node::before {
  content: '';
  position: absolute;
  left: -12px;
  top: 0;
  bottom: 0;
  width: 3px;
  background-color: #ec4899;
  border-radius: 3px;
  transition: background-color 0.2s ease;
}

.node-controls {
  position: absolute;
  left: -40px;
  top: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 10;
}

.image-node:hover .node-controls,
.image-node.is-selected .node-controls {
  opacity: 1;
}

.control-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  background-color: white;
  border: 1px solid #e5e7eb;
  color: #6b7280;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.control-btn:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.move-up-btn:hover,
.move-down-btn:hover {
  color: #2563eb;
}

.delete-btn:hover {
  color: #dc2626;
}

/* Image Controls */
.image-controls {
  position: absolute;
  top: -30px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 5;
}

.image-node:hover .image-controls,
.image-node.is-selected .image-controls {
  opacity: 1;
}

.image-size-controls,
.image-alignment-controls {
  display: flex;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.size-btn,
.align-btn,
.replace-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background-color: white;
  border: none;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.size-btn:hover,
.align-btn:hover,
.replace-btn:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.size-btn.active,
.align-btn.active {
  background-color: #dbeafe;
  color: #2563eb;
}

.replace-btn {
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.replace-btn:hover {
  color: #0891b2;
}

.hidden-input {
  display: none;
}

/* Image Wrapper */
.image-wrapper {
  overflow: hidden;
  border-radius: 4px;
}

.image-wrapper img {
  display: block;
  max-width: 100%;
  height: auto;
}

/* Image Alignment */
.image-align-left {
  margin-right: auto;
}

.image-align-center {
  margin-left: auto;
  margin-right: auto;
  text-align: center;
}

.image-align-right {
  margin-left: auto;
}

/* Image Size */
.image-size-small .image-wrapper {
  max-width: 300px;
}

.image-size-medium .image-wrapper {
  max-width: 500px;
}

.image-size-large .image-wrapper {
  max-width: 800px;
}

/* Image Caption */
.image-caption {
  text-align: center;
  color: #6b7280;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

/* For smaller screens */
@media (max-width: 768px) {
  .image-node {
    padding-top: 2.5rem;
  }

  .node-controls {
    top: -30px;
    left: 0;
    height: auto;
    flex-direction: row;
    width: 100%;
    justify-content: center;
  }

  .image-controls {
    top: -60px;
  }
}
</style>
