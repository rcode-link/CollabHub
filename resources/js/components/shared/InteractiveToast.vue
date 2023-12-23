<template>
  <div @click="showToastFn">
    <slot name="trigger"></slot>
  </div>
    <fwb-toast alignment="start"
               v-if="showToast"
               @close="() => {hideToast(); timer.clear();}"
               closable
               :class="`fixed bottom-6 right-6 overflow-hidden shadow show-timer ${type ?? 'default'}`"
               @mouseenter="() => timer.pause()"
               @mouseleave="() => timer.resume()"
    >
      <span class="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
        <slot name="title"></slot>
      </span>
      <div class="mb-2 text-sm font-normal">
<slot name="content"></slot>
      </div>
      <div class="grid grid-cols-2 gap-2" @click="hideToast">
        <slot name="actions"></slot>
      </div>
    </fwb-toast>
</template>

<script setup>
import {FwbToast} from 'flowbite-vue'
import {ref, watch} from "vue";
import {useTimer} from "../../functions/timer.js";

defineProps({
  type: 'default'
})
const showToast = ref(false)
const timer = useTimer();
const showToastFn = () => {
  showToast.value = true
};

watch(showToast, () => {
    if(!showToast){
        return;
    }
    timer.setTimer(() => {
        hideToast();
    }, 4000);
})
const hideToast = () => {
  showToast.value = false;
};

defineExpose({
  hideToast,
  showToastFn,
    showToast
})

</script>
<style scoped>
@keyframes changeWidth {
    from {width: 100%;}
    to {width: 0%;}
}
.show-timer:hover:after {
    animation-play-state: paused;
}
.show-timer:after {
    content: ' ';
  @apply absolute h-1 w-full top-0 left-0;
    animation-name: changeWidth;
    animation-duration: 4s;
}

.default:after {
  @apply bg-blue-700 dark:bg-blue-600;
}

.green:after {
  @apply bg-green-700 dark:bg-green-600;
}

.red:after {
  @apply bg-red-700 dark:bg-red-600;
}
</style>
