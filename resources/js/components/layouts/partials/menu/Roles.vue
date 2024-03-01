<script setup lang="js">
import { useAbility } from "@casl/vue";
import { useRoleStore } from "../../../../store/roleStore";
import { useUserStore } from "../../../../store/user";
import CreateRoleModal from "../../../pages/settings/role/partials/CreateRoleModal.vue";

import {
    FwbListGroup,
    FwbListGroupItem,
    FwbHeading,
    FwbButton,
} from "flowbite-vue";
import { ref } from "vue";
const createRoleModalRef = ref();

const { can } = useAbility();
const userStore = useUserStore();
const roleStore = useRoleStore();
</script>
<template>
    <CreateRoleModal ref="createRoleModalRef" />
    <div class="flex justify-between items-center">
        <FwbHeading
            tag="h4"
            v-if="can(`can-manage-roles.${userStore.company.id}`, '')"
            >Roles
        </FwbHeading>
        <fwb-button
            @click="() => createRoleModalRef.modalRef.toggleModal()"
            color="alternative"
            size="xs"
            >+
        </fwb-button>
    </div>
    <fwb-list-group
        v-if="can(`can-manage-roles.${userStore.company.id}`, '')"
        class="w-full mb-4"
    >
        <fwb-list-group-item
            class="flex-col !items-start"
            v-for="obj in roleStore.roles"
        >
            <router-link
                :to="{
                    name: 'settings.roles',
                    params: { id: obj.id },
                }"
            >
                {{ obj.title }}
            </router-link>
        </fwb-list-group-item>
    </fwb-list-group>
</template>
