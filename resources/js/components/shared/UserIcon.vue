<script setup lang="ts">
import { FwbAvatar } from "flowbite-vue";
import { useUserStore } from "../../store/user";
import {
    AvatarSize,
    AvatarStatus,
} from "flowbite-vue/dist/components/FwbAvatar/types";
import { ChatResource, UserResource } from "@/types";
import { toNumber } from "lodash";
const userState = useUserStore();

const props = withDefaults(
    defineProps<{
        user: ChatResource | UserResource;
        status: boolean;
        avatarSize: AvatarSize;
    }>(),
    {
        status: true,
        avatarSize: "sm",
    }
);

const getUserStatus = (): AvatarStatus => {
    let usersOnlineLength = userState.onlineUsers.filter(
        (obj) => obj.id === (props.user as UserResource)?.id
    ).length;

    if (props.user && "chatable_id" in props.user) {
        usersOnlineLength = userState.onlineUsers.filter(
            (obj) =>
                obj.id === toNumber((props.user as ChatResource)?.chatable_id)
        ).length;
    }

    return usersOnlineLength ? "online" : "away";
};
</script>

<template>
    <span class="relative flex gap-0.5 items-center">
        <fwb-avatar
            :size="avatarSize"
            :img="user?.avatar"
            status-position="top-right"
            :status="getUserStatus()"
        />
    </span>
</template>

<style scoped></style>
