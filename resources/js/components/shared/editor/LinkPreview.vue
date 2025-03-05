<template>
  <NodeViewWrapper>
    <div
      :class="containerClass"
      data-link-preview
    >
      <a
        v-if="showPreview && image"
        :href="url"
        :target="target"
        :rel="rel"
        :class="imageLinkClass"
      >
        <img
          :src="image"
          :alt="title || url"
          :class="imageClass"
        />
      </a>

      <div
        v-if="showPreview"
        :class="contentContainerClass"
      >
        <a
          :href="url"
          :target="target"
          :rel="rel"
          :class="titleLinkClass"
        >
          <h5 :class="titleClass">{{ title || url }}</h5>
        </a>
        <p
          v-if="description"
          :class="descriptionClass"
        >{{ description }}</p>
        <span :class="urlClass">{{ url }}</span>
      </div>

      <a
        v-else
        :href="url"
        :target="target"
        :rel="rel"
        :class="plainLinkClass"
      >{{ url }}</a>
    </div>
  </NodeViewWrapper>
</template>

<script setup>
import { computed , ref} from "vue";

import { NodeViewWrapper, NodeViewContent } from "@tiptap/vue-3";

const props = defineProps({
  node: Object,
  updateAttributes: Function,
  extension: Object,
});
const options = props.extension.options.extension;
const { url, title, description, image } = props.node.attrs;

const showPreview = computed(() => options.defaultShowPreview);
const cssClasses = options.cssClasses ?? {};
const newItem = ref()


console.log(props.node.attrs);

const containerClass = computed(() => cssClasses.container);
const imageLinkClass = computed(() => cssClasses.imageLink);
const imageClass = computed(() => cssClasses.image);
const contentContainerClass = computed(() => cssClasses.contentContainer);
const titleLinkClass = computed(() => cssClasses.titleLink);
const titleClass = computed(() => cssClasses.title);
const descriptionClass = computed(() => cssClasses.description);
const urlClass = computed(() => cssClasses.url);
const plainLinkClass = computed(() => cssClasses.plainLink || "");

const target = computed(() =>
  props.extension.options.openInNewTab ? "_blank" : null
);
const rel = computed(() =>
  props.extension.options.openInNewTab ? "noopener noreferrer" : null
);
</script>
