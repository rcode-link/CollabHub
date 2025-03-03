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
      <fwb-button-group class="ml-auto">
        <fwb-button
          @click="() => updateAttributes({ size: '25' })"
          size="sm"
          color="alternative"
        >25%</fwb-button>
        <fwb-button
          @click="() => updateAttributes({ size: '50' })"
          size="sm"
          color="alternative"
        >50%</fwb-button>
        <fwb-button
          @click="() => updateAttributes({ size: '75' })"
          size="sm"
          color="alternative"
        >75%</fwb-button>
        <fwb-button
          @click="() => updateAttributes({ size: '100' })"
          size="sm"
          color="alternative"
        >100%</fwb-button>

                <fwb-button
color="alternative"
                    size="sm" disabled>|</fwb-button>
        <fwb-button
          @click="() => updateAttributes({ position: 'left' })"
          size="sm"
          color="alternative"
        >Left</fwb-button>
        <fwb-button
          @click="() => updateAttributes({ position: 'center' })"
          size="sm"
          color="alternative"
        >Center</fwb-button>
        <fwb-button
          @click="() => updateAttributes({ position: 'right' })"
          size="sm"
          color="alternative"
        >Right</fwb-button>

      </fwb-button-group>
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
import { FwbP, FwbInput, FwbButtonGroup, FwbButton } from "flowbite-vue";
export default {
  name: "ResizableImage",

  components: {
    BaseContianer,
    FwbButton,
    FwbButtonGroup,
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
