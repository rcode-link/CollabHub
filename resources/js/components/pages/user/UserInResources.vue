<template>
  <router-link  :to="generateLink()">
    {{ obj.name }}
  </router-link>
</template>
<script setup lang="ts">
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
