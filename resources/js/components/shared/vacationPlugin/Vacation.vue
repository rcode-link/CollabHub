<script setup>
import { NodeViewWrapper } from "@tiptap/vue-3";
import VacationCard from "@/components/shared/vacationPlugin/VacationCard.vue";

defineProps({
    node: {},
});
</script>

<template>
    <node-view-wrapper>
        <VacationCard :event-id="node.attrs.eventId" />
    </node-view-wrapper>
</template>
