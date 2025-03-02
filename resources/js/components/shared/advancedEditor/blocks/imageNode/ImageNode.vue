<template>
  <BaseContianer
    :editor="editor"
    :node="node"
    :deleteNode="deleteNode"
    :getPos="getPos"
    :selected="selected"

      :width="node.attrs.width"
  >
    <img
      :src="node.attrs.src"
      :alt="node.attrs.alt"
      :title="node.attrs.title"
      :width="node.attrs.width"
      :height="node.attrs.height"
      ref="imageRef"
      @dragstart.prevent
    />
    <div
      v-if="selected"
      class="resize-handlers"
    >
      <div
        class="resize-handle bottom-right"
        @mousedown.prevent="startResizing($event, 'bottomRight')"
      ></div>
    </div>
  </BaseContianer>
</template>

<script>
import BaseContianer from "../BaseContainer.vue";
export default {
  name: "ResizableImage",

  components: {
    BaseContianer,
  },
  props: {
    editor: {
      type: Object,
      required: true,
    },
    node: {
      type: Object,
      required: true,
    },
    selected: {
      type: Boolean,
      default: false,
    },
    updateAttributes: {
      type: Function,
      required: true,
    },
    extension: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      resizing: false,
      initialPosition: {
        x: 0,
        y: 0,
      },
      initialSize: {
        width: 0,
        height: 0,
      },
      currentHandler: null,
    };
  },

  methods: {
    startResizing(event, handler) {
      this.resizing = true;
      this.currentHandler = handler;

      // Store initial cursor position
      this.initialPosition = {
        x: event.clientX,
        y: event.clientY,
      };

      // Store initial image dimensions
      const image = this.$refs.imageRef;

      this.initialSize = {
        width: image.clientWidth,
        height: image.clientHeight,
      };

      // Add event listeners
      document.addEventListener("mousemove", this.handleResizing);
      document.addEventListener("mouseup", this.stopResizing);
    },

    handleResizing(event) {
      if (!this.resizing) return;

      // Calculate the distance moved
      const dx = event.clientX - this.initialPosition.x;
      const dy = event.clientY - this.initialPosition.y;

      const aspectRatio = this.initialSize.width / this.initialSize.height;

      let newWidth, newHeight;

      if (this.currentHandler === "bottomRight") {
        // Calculate new dimensions while maintaining aspect ratio
        // Use the larger of dx and dy to determine the dominant direction
        if (Math.abs(dx) > Math.abs(dy)) {
          newWidth = Math.max(20, this.initialSize.width + dx);
          newHeight = newWidth / aspectRatio;
        } else {
          newHeight = Math.max(20, this.initialSize.height + dy);
          newWidth = newHeight * aspectRatio;
        }
      }

      // Update image size with new dimensions
      this.updateAttributes({
        width: `${newWidth}px`,
        height: `${newHeight}px`,
      });
    },

    stopResizing() {
      this.resizing = false;

      // Remove event listeners
      document.removeEventListener("mousemove", this.handleResizing);
      document.removeEventListener("mouseup", this.stopResizing);
    },
  },

  beforeUnmount() {
    // Clean up any remaining listeners
    document.removeEventListener("mousemove", this.handleResizing);
    document.removeEventListener("mouseup", this.stopResizing);
  },
};
</script>

<style>
.resizable-image-wrapper {
  display: inline-block;
  position: relative;
}

.is-selected img {
  outline: 2px solid #1976d2;
}

.resize-handlers {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.resize-handle {
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: #1976d2;
  border-radius: 50%;
  pointer-events: all;
}

.bottom-right {
  bottom: -5px;
  right: -5px;
  cursor: nwse-resize;
}
</style>
