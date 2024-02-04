<script setup lang="ts">
import { FwbAvatar } from "flowbite-vue";
import { useUserStore } from "../../store/user";
import { AvatarSize } from "flowbite-vue/dist/components/FwbAvatar/types";
const userState = useUserStore();

const props = withDefaults(
    defineProps<{
        user: any;
        status: boolean;
        avatarSize: AvatarSize;
    }>(),
    {
        user: null,
        status: true,
        avatarSize: "sm",
    }
);

const getUserStatus = () => {
    return userState.onlineUsers.filter((obj) => obj.id === props.user?.id)
        .length;
};
</script>

<template>
    <span class="relative overflow-hidden flex gap-0.5 items-center">
        <div
            v-if="status"
            :class="{
                'w-2 h-2 rounded z-50': true,
                'bg-green-600': getUserStatus(),
            }"
        />
        <fwb-avatar :size="avatarSize" :img="user?.avatar" />
    </span>
</template>

<style scoped></style>
