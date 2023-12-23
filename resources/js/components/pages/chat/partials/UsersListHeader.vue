<script setup>

import CreateChat from "./CreateChat.vue";
import Card from "../../../shared/Card.vue";
import {FwbButton} from "flowbite-vue";
import {computed} from "vue";
import {useRoute, useRouter} from "vue-router";

const router = useRouter();
const route = useRoute();
const changeChatFilter = (type) => {
  const routeQuery = {
    ...route.query,
    type: type
  };
  router.push({
    query: routeQuery
  })
}
const activeTab = computed(() => {
  if(['user',
    'group',
    'system'].indexOf(route.query.type) === -1){
    return 'all'
  }

  return route.query.type;
})
</script>

<template>
  <Card class="gap-4 sticky top-0 bg-white dark:bg-grey-700 z-10">
    <fwb-button :color="activeTab === 'all' ?'default' : 'dark'" outline square
                @click="() => changeChatFilter('none')">
      <svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M6.143 1H1.857A.857.857 0 0 0 1 1.857v4.286c0 .473.384.857.857.857h4.286A.857.857 0 0 0 7 6.143V1.857A.857.857 0 0 0 6.143 1Zm10 0h-4.286a.857.857 0 0 0-.857.857v4.286c0 .473.384.857.857.857h4.286A.857.857 0 0 0 17 6.143V1.857A.857.857 0 0 0 16.143 1Zm-10 10H1.857a.857.857 0 0 0-.857.857v4.286c0 .473.384.857.857.857h4.286A.857.857 0 0 0 7 16.143v-4.286A.857.857 0 0 0 6.143 11Zm10 0h-4.286a.857.857 0 0 0-.857.857v4.286c0 .473.384.857.857.857h4.286a.857.857 0 0 0 .857-.857v-4.286a.857.857 0 0 0-.857-.857Z"/>
      </svg>
    </fwb-button>
    <fwb-button :color="activeTab === 'user' ?'default' : 'dark'" outline square
                @click="() => changeChatFilter('user')">

      <svg class="w-6 h-6" aria-hidden="true"
           xmlns="http://www.w3.org/2000/svg"
           fill="none" viewBox="0 0 20 18">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M5 5h9M5 9h5m8-8H2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h4l3.5 4 3.5-4h5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1Z"/>
      </svg>
    </fwb-button>
    <fwb-button :color="activeTab === 'group' ?'default' : 'dark'" outline square
                @click="() => changeChatFilter('group')">
      <svg class="w-6 h-6" aria-hidden="true"
           xmlns="http://www.w3.org/2000/svg"
           fill="none" viewBox="0 0 20 20">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4.333 6.764a3 3 0 1 1 3.141-5.023M2.5 16H1v-2a4 4 0 0 1 4-4m7.379-8.121a3 3 0 1 1 2.976 5M15 10a4 4 0 0 1 4 4v2h-1.761M13 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm-4 6h2a4 4 0 0 1 4 4v2H5v-2a4 4 0 0 1 4-4Z"/>
      </svg>
    </fwb-button>
    <fwb-button :color="activeTab === 'system' ?'default': 'dark'" outline square
                @click="() => changeChatFilter('system')">
      <svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
           fill="none" viewBox="0 0 16 16">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8 12V1m0 0L4 5m4-4 4 4m3 5v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3"/>
      </svg>
    </fwb-button>
    <span class="ml-auto">
        <slot></slot>
      </span>
  </Card>
</template>

<style scoped>

</style>
