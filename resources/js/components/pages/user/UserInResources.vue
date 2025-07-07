<template>
    <fwb-list-group-item>
  <router-link  :to="generateLink()">
    {{ obj.name }}
  </router-link>
    </fwb-list-group-item>
</template>
<script setup>
import { FwbListGroupItem } from 'flowbite-vue'
const props = defineProps({
    obj: {}
})

const generateLink = () => {
    switch (props.obj.type) {
        case 'App\\Models\\Company':
            return '#';
        case 'App\\Models\\Project':
            return `/projects/${props.obj.id}`
    }
}
</script>
