<template>
  <BaseContianer
    :editor="editor"
    :node="node"
    :deleteNode="deleteNode"
    :getPos="getPos"
    :selected="selected"
    :width="node.attrs.width"
  >

    <template #options>
      <div v-if="selected" class="img-controls" title="Image options">
        <!-- Size group -->
        <div class="ctrl-group">
          <button
            :class="['ctrl-btn ctrl-btn-text', node.attrs.size === '25' && 'ctrl-btn-active']"
            title="25% width"
            @click="() => updateAttributes({ size: '25' })"
          >25%</button>
          <button
            :class="['ctrl-btn ctrl-btn-text', node.attrs.size === '50' && 'ctrl-btn-active']"
            title="50% width"
            @click="() => updateAttributes({ size: '50' })"
          >50%</button>
          <button
            :class="['ctrl-btn ctrl-btn-text', node.attrs.size === '75' && 'ctrl-btn-active']"
            title="75% width"
            @click="() => updateAttributes({ size: '75' })"
          >75%</button>
          <button
            :class="['ctrl-btn ctrl-btn-text', node.attrs.size === '100' && 'ctrl-btn-active']"
            title="100% width"
            @click="() => updateAttributes({ size: '100' })"
          >100%</button>
        </div>

        <div class="ctrl-sep" />

        <!-- Position group -->
        <div class="ctrl-group">
          <button
            :class="['ctrl-btn', node.attrs.position === 'left' && 'ctrl-btn-active']"
            title="Align left"
            @click="() => updateAttributes({ position: 'left' })"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18M3 12h12M3 18h8"/>
            </svg>
          </button>
          <button
            :class="['ctrl-btn', node.attrs.position === 'center' && 'ctrl-btn-active']"
            title="Align center"
            @click="() => updateAttributes({ position: 'center' })"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18M6 12h12M8 18h8"/>
            </svg>
          </button>
          <button
            :class="['ctrl-btn', node.attrs.position === 'right' && 'ctrl-btn-active']"
            title="Align right"
            @click="() => updateAttributes({ position: 'right' })"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18M9 12h12M13 18h8"/>
            </svg>
          </button>
        </div>
      </div>
    </template>
    <div
      v-if="selected"
      class="mt-1"
    />
    <div :class="`resizable-image-wrapper shadow rounded image-${node.attrs.size} position-${node.attrs.position}`">
      <img
        :src="node.attrs.src"
        :alt="node.attrs.alt"
        :title="node.attrs.title"
        ref="imageRef"
        @dragstart.prevent
      />
      <FwbP
        class="text-center"
        v-if="!selected"
      >{{ title }}</FwbP>
    </div>
    <FwbInput
      v-if="selected"
      v-model="title"
    />
  </BaseContianer>
</template>

<script>
//      <div
//        v-if="selected"
//        class="resize-handlers"
//      >
//        <div
//          class="resize-handle bottom-right"
//          @mousedown.prevent="startResizing($event, 'bottomRight')"
//        ></div>
//      </div>
import BaseContianer from "../BaseContainer.vue";
import { FwbP, FwbInput } from "flowbite-vue";
export default {
  name: "ResizableImage",

  components: {
    BaseContianer,
    FwbInput,
    FwbP,
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

  computed: {
    title: {
      get() {
        return this.node.attrs.title;
      },
      set(val) {
        this.updateAttributes({
          title: val,
        });
      },
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
.img-controls {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 6px;
  margin-bottom: 2px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  flex-wrap: wrap;
}

.dark .img-controls {
  background: #111827;
  border-color: #374151;
}

.ctrl-group {
  display: flex;
  align-items: center;
  gap: 2px;
}

.ctrl-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 4px;
  color: #6b7280;
  transition: background 0.1s, color 0.1s;
  flex-shrink: 0;
}
.ctrl-btn svg {
  width: 14px;
  height: 14px;
}
.ctrl-btn:hover {
  background: #e5e7eb;
  color: #111827;
}
.dark .ctrl-btn {
  color: #9ca3af;
}
.dark .ctrl-btn:hover {
  background: #374151;
  color: #f9fafb;
}
.ctrl-btn-text {
  width: auto;
  padding: 0 8px;
  font-size: 0.75rem;
  font-weight: 500;
}
.ctrl-btn-active {
  background: #eff6ff;
  color: #2563eb;
}
.dark .ctrl-btn-active {
  background: #1e3a8a;
  color: #93c5fd;
}

.ctrl-sep {
  width: 1px;
  height: 16px;
  background: #e5e7eb;
  margin: 0 2px;
  flex-shrink: 0;
}
.dark .ctrl-sep {
  background: #374151;
}

.resizable-image-wrapper {
  display: block;
  position: relative;
  margin-top: 1rem;
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

.lh-34 {
  line-height: 34px;
}

img {
  display: block;
  width: 100%;
  height: auto;
}

.image-25 {
  width: 25%;
}

.image-50 {
  width: 50%;
}

.image-75 {
  width: 75%;
}

.image-100 {
  width: 100%;
}

.position-left {
  margin-right: auto;
}

.position-right {
  margin-left: auto;
}

.position-center {
  margin-left: auto;
  margin-right: auto;
}
/* Print styles for image component with position classes */


</style>
