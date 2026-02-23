<template>
  <BaseContianer
    :editor="editor"
    :node="node"
    :deleteNode="deleteNode"
    :getPos="getPos"
    :selected="selected"
  >
    <template #options>
      <div v-if="selected" class="drawio-controls" title="Diagram options">
        <!-- Size group -->
        <div class="ctrl-group">
          <button
            :class="['ctrl-btn ctrl-btn-text', node.attrs.size === '25' && 'ctrl-btn-active']"
            title="25% width"
            @click="updateAttributes({ size: '25' })"
          >25%</button>
          <button
            :class="['ctrl-btn ctrl-btn-text', node.attrs.size === '50' && 'ctrl-btn-active']"
            title="50% width"
            @click="updateAttributes({ size: '50' })"
          >50%</button>
          <button
            :class="['ctrl-btn ctrl-btn-text', node.attrs.size === '75' && 'ctrl-btn-active']"
            title="75% width"
            @click="updateAttributes({ size: '75' })"
          >75%</button>
          <button
            :class="['ctrl-btn ctrl-btn-text', node.attrs.size === '100' && 'ctrl-btn-active']"
            title="100% width"
            @click="updateAttributes({ size: '100' })"
          >100%</button>
        </div>

        <div class="ctrl-sep" />

        <!-- Position group -->
        <div class="ctrl-group">
          <button
            :class="['ctrl-btn', node.attrs.position === 'left' && 'ctrl-btn-active']"
            title="Align left"
            @click="updateAttributes({ position: 'left' })"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18M3 12h12M3 18h8"/>
            </svg>
          </button>
          <button
            :class="['ctrl-btn', node.attrs.position === 'center' && 'ctrl-btn-active']"
            title="Align center"
            @click="updateAttributes({ position: 'center' })"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18M6 12h12M8 18h8"/>
            </svg>
          </button>
          <button
            :class="['ctrl-btn', node.attrs.position === 'right' && 'ctrl-btn-active']"
            title="Align right"
            @click="updateAttributes({ position: 'right' })"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18M9 12h12M13 18h8"/>
            </svg>
          </button>
        </div>

        <div class="ctrl-sep" />

        <!-- Edit diagram -->
        <div class="ctrl-group">
          <button class="ctrl-btn ctrl-btn-text" title="Edit diagram" @click="openDialog">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit
          </button>
        </div>

        <!-- Delete — pushed right -->
        <button class="ctrl-btn ctrl-btn-danger ctrl-btn-text ml-auto" title="Delete diagram" @click="deleteNode">
          Delete
        </button>
      </div>
    </template>

    <div :class="`resizable-image-wrapper shadow rounded image-${node.attrs.size} position-${node.attrs.position} ${selected ? 'drawio-selected' : ''}`">
      <img
        :src="node.attrs.src"
        :alt="node.attrs.alt || 'Diagram'"
        class="drawio-img"
        @dblclick="openDialog"
      />
    </div>
  </BaseContianer>
</template>

<script>
import BaseContianer from "@/components/shared/advancedEditor/blocks/BaseContainer.vue";

export default {
  name: "DrawIONodeView",
  components: { BaseContianer },
  props: {
    editor: { type: Object, required: true },
    node: { type: Object, required: true },
    selected: { type: Boolean, default: false },
    updateAttributes: { type: Function, required: true },
    deleteNode: { type: Function, required: true },
    getPos: { type: Function, required: true },
    extension: { type: Object, required: true },
  },
  methods: {
    openDialog() {
      const drawIoLink =
        this.extension?.options?.drawIoLink ||
        "https://embed.diagrams.net/?embed=1&ui=atlas&spin=1&modified=unsavedChanges&proto=json";
      const dialogWidth = this.extension?.options?.width || "99vw";
      const dialogHeight = this.extension?.options?.height || "99vh";
      const currentSrc = this.node.attrs.src;
      const currentXml = this.node.attrs.drawioXml;
      const updateAttributes = this.updateAttributes;

      const dialog = document.createElement("dialog");
      dialog.style.border = "0";
      dialog.style.padding = "0";

      const iframe = document.createElement("iframe");
      iframe.setAttribute("frameborder", "0");
      iframe.setAttribute("src", drawIoLink);
      iframe.style.width = dialogWidth;
      iframe.style.height = dialogHeight;

      dialog.appendChild(iframe);
      document.body.appendChild(dialog);
      dialog.showModal();

      const receive = (event) => {
        if (!event.data || event.data.length === 0) return;
        let msg;
        try {
          msg = JSON.parse(event.data);
        } catch {
          return;
        }
        switch (msg.event) {
          case "init":
            // drawioXml holds the full xmlpng (PNG with embedded XML) from the
            // last save — send it back so DrawIO can restore the diagram for editing.
            // Fall back to src for legacy diagrams that were saved as base64.
            iframe.contentWindow.postMessage(
              JSON.stringify({
                action: "load",
                xmlpng: currentXml || currentSrc || "",
              }),
              "*"
            );
            break;

          case "save":
            // Request the full xmlpng — one round-trip, guaranteed to work.
            iframe.contentWindow.postMessage(
              JSON.stringify({ action: "export", format: "xmlpng", spinKey: "saving" }),
              "*"
            );
            break;

          case "export": {
            // msg.data is a base64 data-URL of the xmlpng.
            // Upload the PNG to SeaweedFS for display; keep the raw xmlpng in
            // drawioXml so we can reload the diagram without a server round-trip.
            const xmlpng = msg.data;
            axios
              .post("/api/v1/editor/drawio", { data: xmlpng })
              .then(({ data }) => {
                updateAttributes({ src: data.url, drawioXml: xmlpng });
              })
              .catch(() => {
                // Fallback: store base64 inline (original behaviour)
                updateAttributes({ src: xmlpng, drawioXml: xmlpng });
              });
            break;
          }

          case "exit":
            window.removeEventListener("message", receive);
            document.body.removeChild(dialog);
            dialog.close();
            break;
        }
      };
      window.addEventListener("message", receive);
    },
  },
};
</script>

<style>
.drawio-controls {
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

.dark .drawio-controls {
  background: #111827;
  border-color: #374151;
}

.drawio-selected img {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.drawio-img {
  cursor: pointer;
}
</style>
