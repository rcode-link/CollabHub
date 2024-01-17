<script setup>

import DocumentPrintTree from "./DocumentPrintTree.vue";
import Card from "../../../../shared/Card.vue";
import {ref} from "vue";
import ArrowDownIcon from "../../../../shared/icons/ArrowDownIcon.vue";
import {useRouter} from "vue-router";
import {DateTime} from "luxon";

const router = useRouter();
const props = defineProps({
  obj: {}
})

const showChildren = ref(false);

const handleClick = () => {
  if (props.obj.type === 'folder') {
    showChildren.value = !showChildren.value;
    return;
  }

  router.push({
    name: 'project.documents.editor',
    params: {
      id: props.obj.id
    }
  })

}
</script>

<template>
  <Card @click="handleClick" class="items-center gap-2 cursor-pointer">
    <div :class="{
            'rotate-90': !showChildren
        }">
      <ArrowDownIcon v-if="obj.type === 'folder'" :class="{'w-4 h-4': true }"/>
    </div>
    <div>
      {{ obj.title }}
    </div>
    <div v-if="obj.type !== 'folder'" class="ml-auto text-xs">
      <template v-if="obj.type === 'file'">
        <b>
          {{obj.file_id}}
        </b>
      </template>
      Edited: {{DateTime.fromISO(obj.updated_at).toLocaleString(DateTime.DATETIME_SHORT)}}
    </div>
  </Card>
  <div
      v-show="showChildren" class="ml-4">
    <DocumentPrintTree :parent_id="obj.id"/>
  </div>
</template>

<style scoped>
.rotate-90 {
  transform: rotate(-90deg);
}
</style>
