<script setup lang="js">
import { useAbility } from "@casl/vue";
import { useRoleStore } from "@/store/roleStore";
import { useUserStore } from "@/store/user";
import CreateRoleModal from "@/components/pages/settings/role/partials/CreateRoleModal.vue";
import Button from "@/components/shared/Button.vue";
import { ref } from "vue";

const createRoleModalRef = ref();
const { can } = useAbility();
const userStore = useUserStore();
const roleStore = useRoleStore();
</script>
<template>
    <CreateRoleModal ref="createRoleModalRef" />
    <div v-if="can(`can-manage-roles.${userStore.company.id}`, '')">
        <div class="flex items-center justify-between px-3 mb-2">
            <h4
                class="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500"
            >
                Roles
            </h4>
            <Button
                variant="ghost"
                size="sm"
                @click="() => createRoleModalRef.modalRef.toggleModal()"
            >
                +
            </Button>
        </div>
        <nav class="space-y-0.5">
            <router-link
                v-for="obj in roleStore.roles"
                :key="obj.id"
                :to="{
                    name: 'settings.roles',
                    params: { id: obj.id },
                }"
                class="sidebar-nav-link"
            >
                {{ obj.title }}
            </router-link>
        </nav>
    </div>
</template>
