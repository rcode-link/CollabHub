<template>
  <div class="shadow p-1 flex min-w-[15vw] items-center gap-4 p-4">
    <div class="flex flex-1 gap-4 ">
      <div>
        <FileImage v-if="getFileType(file) === 'image'"/>
        <FileFile v-else/>
      </div>
      <div class="whitespace-nowrap overflow-hidden">
        {{ file.name }}
      </div>
    </div>
    <InteractiveToast v-if="index !== -1" ref="toast">
      <template #trigger>
        <svg
            class="w-4 h-4 text-red-800 dark:text-red-500 hover:text-red-900 dark:hover:text-red-900 cursor-pointer"
            aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 20">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M1 5h16M7 8v8m4-8v8M7 1h4a1 1 0 0 1 1 1v3H6V2a1 1 0 0 1 1-1ZM3 5h12v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5Z"/>
        </svg>
      </template>
      <template #title>
        Are you sure?
      </template>

      <template #content>
        You are about to delete delete {{ file.name }}. Are you sure?
      </template>
      <template #actions>
        <fwb-button size="xs" @click="deleteRecord">
          Yes! Delete it.
        </fwb-button>
      </template>
    </InteractiveToast>
  </div>
</template>
<script setup lang="ts">
import InteractiveToast from "../../../../shared/InteractiveToast.vue";
import {FwbButton} from "flowbite-vue";
import FileImage from "../../../../shared/icons/FileImage.vue";
import FileFile from "../../../../shared/icons/FileFile.vue";
import {ref} from "vue";
import {chatDetails} from "../../../../../store/chatStore.js";

const files = chatDetails()

const toast = ref(null);

const props = defineProps({
  file: {},
  index: -1
});

const deleteRecord =
    (e) => {
      e.preventDefault();
      toast.value.hideToast();
      files.removeFile(props.index);
    }


const getFileType = ({type}) => type.split('/')[0];
</script>
<style scoped>


</style>
