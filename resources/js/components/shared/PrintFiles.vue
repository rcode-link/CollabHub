<script setup>

import FileImage from "./icons/FileImage.vue";
import {FwbImg, FwbP} from "flowbite-vue";
import {ref} from "vue";

defineProps({media: [], full: false})

const showImage = ref('');
const open = (obj) => {
    console.log(obj)
    showImage.value = obj;
}
</script>

<template>
   <teleport to="#app">
       <div v-if="showImage" class="fixed flex show-image top-0 left-0 right-0 bottom-0 bottom-0 bg-gray-50 z-50">
           <fwb-img class="w-auto shadow p-2 h-auto max-h-full m-auto"
                    :src="showImage" alt="" />
           <div class="fixed cursor-pointer hover:underline top-5 right-5 z-[55]" @click="() => showImage = ''">Close</div>
       </div>
   </teleport>
    <template v-for="obj in media">
        <template v-if="obj.type.indexOf('image/') > -1">
           <div>
               <fwb-img @click="() => open(obj.path)" class="w-36 shadow p-2 h-auto"
                        :src="obj.path" :alt="obj.name"/>
               <p class="text-xs">
                   {{ obj.name }}
               </p>
           </div>
        </template>
        <a v-else :class="{
                  'flex py-2 px-2 my-4 flex-1 gap-4 items-center border rounded-xl': true,
                 'w-fit': !full,
                 'w-full': full
                 }" :href="obj.path"
           target="_blank">
            <div>
                <FileImage/>
            </div>
            <div class="whitespace-nowrap overflow-hidden">
                {{ obj.name }}
                <fwb-p class="w-12 text-xs">
                    {{ obj.type }} {{}}
                </fwb-p>
            </div>
        </a>
    </template>
</template>

<style scoped>

</style>
