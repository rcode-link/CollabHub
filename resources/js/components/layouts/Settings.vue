<script setup>

import Auth from "./Auth.vue";
import {useAbility} from "@casl/vue";
import {useUserStore} from "../../store/user.js";
import {FwbButton, FwbListGroup, FwbListGroupItem} from "flowbite-vue";
import {useRoleStore} from "../../store/roleStore.js";
import {computed, ref} from "vue";
import {useRoute} from "vue-router";
import CreateRoleModal from "../pages/settings/role/partials/CreateRoleModal.vue";
import MenuIcon from "../shared/icons/MenuIcon.vue";

const createRoleModalRef = ref(null);

const { can, rules } = useAbility()
const userStore = useUserStore();
const roleStore = useRoleStore();
const route = useRoute();

const isMenuVisible = ref(false);
const isMobile = () => {
    return screen.width <= 760;
}

const showMenu = computed(() => {
    if(!isMobile()){
        return true;
    }

    return isMenuVisible.value;
})

</script>

<template>
    <Auth>
        <CreateRoleModal ref="createRoleModalRef"/>
        <div class="flex flex-col md:flex-row gap-4">
            <div class="md:sticky sticky-top">
                <fwb-button class="visible md:hidden mb-1" @click="() => isMenuVisible = !isMenuVisible">
                    <MenuIcon class="w-4 h-4"/>
                </fwb-button>
                <fwb-list-group v-show="showMenu" class="min-w-full md:min-w-[300px] sticky top-1">
                    <fwb-list-group-item>
                        <router-link :to="{name: 'settings.base'}">My profile</router-link>
                    </fwb-list-group-item>
                    <fwb-list-group-item>
                        <router-link :to="{name: 'settings.company'}">Company
                            {{ can(`can-update-company.${userStore.company.id}`) ? 'settings' : '' }}
                        </router-link>
                    </fwb-list-group-item>
                    <fwb-list-group-item v-if="can(`can-view-users.${userStore.company.id}`)">
                        <router-link :to="{name: 'settings.users'}">Users</router-link>
                    </fwb-list-group-item>
                    <fwb-list-group-item v-if="can(`can-manage-roles.${userStore.company.id}`)" class="flex-col !items-start">
                        <div class="flex justify-between items-center w-full show-plus-on-hover">
                            <router-link :to="{name: 'settings.roles'}">Roles</router-link>
                            <fwb-button v-if="route.name === 'settings.roles'" @click="() => createRoleModalRef.modalRef.toggleModal()" class="m-2"
                                        color="alternative" size="xs">+
                            </fwb-button>
                        </div>
                        <ul class="pl-3" v-if="route.name === 'settings.roles'">
                            <li v-for="obj in roleStore.roles" @click="() => roleStore.setActiveRole(obj.id)"
                                :class="`cursor-pointer hover:underline ${roleStore.activeRole === obj.id ? 'font-bold' : ''}`">
                                {{ obj.title }}
                            </li>
                        </ul>
                    </fwb-list-group-item>
                </fwb-list-group>
            </div>
            <slot></slot>
        </div>
    </Auth>
</template>

<style scoped>
.show-plus-on-hover:hover > button {
    opacity: 1;

}

.show-plus-on-hover > button {
    @apply opacity-100 md:opacity-0
}

</style>
