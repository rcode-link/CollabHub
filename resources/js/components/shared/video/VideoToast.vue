<script setup lang="ts">
import { FwbButton } from "flowbite-vue";
import { useRouter } from "vue-router";
const props = defineProps<{
  data: {
    callerName: string;
    callId: string;
  };
}>();
const openCall = () => {
  window.open(`/call/${props.data.callId}`, "_blank");
};
</script>
<template>
  <div>
    <h1>{{ data.callerName }} is calling you.</h1>
    <fwb-button @click="openCall" class="mt-4 w-1/2" size="xs"
      >Answer</fwb-button
    >
  </div>
</template>