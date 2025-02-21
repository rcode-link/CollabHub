<script setup lang="js">
import { FwbAvatar } from "flowbite-vue";
import { useUserStore } from "../../store/user";
import { toNumber } from "lodash";
const userState = useUserStore();

const props = defineProps({
    user: {
        type: Object
    },
    status: {
        type: Boolean,
        default: true
    },
    avatarSize: {
        type: String,
        default: 'sm'
    }
})

const getUserStatus = () => {
    if (!props.status) {
        return {};
    }
    let usersOnlineLength = userState.onlineUsers.filter(
        (obj) => obj.id === (props.user)?.id
    ).length;

    if (props.user && "chatable_id" in props.user) {
        usersOnlineLength = userState.onlineUsers.filter(
            (obj) =>
                obj.id === toNumber((props.user)?.chatable_id)
        ).length;
    }

    const currentStatus = usersOnlineLength ? "online" : "away";

    return {
        status: currentStatus,
    };
};
</script>

<template>
  <span class="relative flex gap-0.5 items-center">
    <fwb-avatar
      :size="avatarSize"
      :img="user?.avatar"
      status-position="top-right"
      v-bind="getUserStatus()"
    />
  </span>
</template>

<style scoped></style>
