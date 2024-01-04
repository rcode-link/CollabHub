<template>
    <fwb-navbar>
        <template #logo>
            <router-link alt=" " image-url="/images/logo.svg" :to="{name: 'home'}">
                <h1 class="font-extrabold leading-none flex gap-0.5 items-center tracking-tight text-gray-900 text-2xl dark:text-white">
                    <fwb-avatar :img="userStore.company.avatar"/>
                    {{ userStore.company.name }}
                </h1>
            </router-link>
        </template>
        <template #default="{isShowMenu}">
            <fwb-navbar-collapse :is-show-menu="isShowMenu" is="div" class="flex items-center mr-[-1rem] menu">
                <router-link alt=" " class="flex justify-center items-center navbar-link" image-url="/images/logo.svg"
                             :to="{name: 'home'}">
                    <tippy content="Home">
                        <svg v-if="!useText" class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                             viewBox="0 0 20 20">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M3 8v10a1 1 0 0 0 1 1h4v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5h4a1 1 0 0 0 1-1V8M1 10l9-9 9 9"/>
                        </svg>
                        <span v-if="useText">Home</span>

                    </tippy>
                </router-link>
                <router-link alt=" " class="flex justify-center items-center relative navbar-link"
                             image-url="/images/logo.svg"
                             :to="{name: 'chat'}">
                    <tippy content="Chat">
                        <svg v-if="!useText" class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                             viewBox="0 0 20 18">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M16 5h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-2v3l-4-3H8m4-13H2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h2v3l4-3h4a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1Z"/>
                        </svg>
                        <span v-if="useText">Chat</span>

                        <div
                            v-if="userStore.newMessages"
                            class="w-2 h-2 ml-auto text-xs bg-red-700 text-white flex absolute top-0 right-0 justify-center items-center rounded-full text-center font-bold p-2 mr-3">
                            {{ userStore.newMessages }}
                        </div>

                    </tippy>
                </router-link>
                <router-link alt=" " class="flex justify-center items-center relative navbar-link"
                             image-url="/images/logo.svg"
                             :to="{name: 'projects'}">
                    <tippy content="Projects">
                        <svg v-if="!useText" class="w-6 h-6 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                             viewBox="0 0 20 16">
                            <path stroke="currentColor" stroke-linejoin="round" stroke-width="2"
                                  d="M8 8v1h4V8m4 7H4a1 1 0 0 1-1-1V5h14v9a1 1 0 0 1-1 1ZM2 1h16a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1Z"/>
                        </svg>
                        <span v-if="useText">Projects</span>
                    </tippy>
                </router-link>
              <fwb-button @click="createTasks.toggleCreateTaskModal" size="xs">
                Add new task
              </fwb-button>

              <fwb-dropdown text="Bottom" placement="left" class="z-20 w-auto">
                    <template #trigger>
                      <div class="w-75">
                            <span class="sr-only">Open user menu</span>
                            <fwb-avatar :img="userStore.user.avatar"/>
                        </div>
                    </template>
                <fwb-list-group class="w-72">
                        <fwb-list-group-item class="flex-col">
                            <div class="flex gap-2 mr-auto">
                              <fwb-avatar :img="userStore.user.avatar"/>
                              <div>
                                 <span
                                     class="block text-left text-sm text-gray-900 dark:text-white">
                                   {{ userStore.user.name }}
                               </span>
                                <span
                                    class="block text-sm overflow-hidden  text-left text-gray-500 truncate dark:text-gray-400">
                                   {{ userStore.user.email }}
                               </span>
                              </div>
                            </div>
                        </fwb-list-group-item>
                  <fwb-list-group-item v-if="can(`can-create-project.${userStore.company.id}`)"
                                       @click="() => hideModal = !hideModal">
                        <div
                            class="cursor-pointer w-full block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">
                          Add new project
                        </div>
                      </fwb-list-group-item>
                        <fwb-list-group-item>

                            <router-link :to="{name: 'settings.base'}"
                                         class="block w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                                Settings
                            </router-link>
                        </fwb-list-group-item>
                        <fwb-list-group-item>
                            <div class="py-2 w-full">
                                <a href="#"
                                   @click="logout"
                                   class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Sign
                                    out</a>
                            </div>
                        </fwb-list-group-item>
                    </fwb-list-group>
                </fwb-dropdown>
            </fwb-navbar-collapse>
        </template>
        <template #menu-icon>
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                 xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
            </svg>
            <div
                v-if="userStore.newMessages"
                class="w-2 h-2 ml-auto text-xs bg-red-700 text-white flex absolute top-0 right-0 justify-center items-center rounded-full text-center font-bold p-2 mr-3">
                {{ userStore.newMessages }}
            </div>
        </template>
    </fwb-navbar>
  <Modal :hide-modal="hideModal" @closed="() => hideModal = false">
    <template #header>
      <h1>
        Create new project
      </h1>
    </template>

    <template #body>
      <CreateProject ref="createProjectRef"/>
    </template>
    <template #footer>
      <fwb-button @click="submitForm">
        Save
      </fwb-button>
    </template>

  </Modal>
</template>

<script setup>
import {
  FwbAvatar,
  FwbButton,
  FwbDropdown,
  FwbListGroup,
  FwbListGroupItem,
  FwbNavbar,
  FwbNavbarCollapse
} from 'flowbite-vue'
import {useUserStore} from "../../store/user.js";
import {useRouter} from "vue-router";
import {ref} from "vue";
import {Tippy} from "vue-tippy";
import CreateProject from "../pages/project/Create.vue";
import Modal from "../shared/Modal.vue";
import {useTasksStore} from "../../store/tasksStore.js";
import {useTextToLinkStore} from "../../store/textToLinkStore.js";
import {useAbility} from "@casl/vue";

const createTasks = useTasksStore();
const {can, rules} = useAbility()


const userStore = useUserStore();
const textToLinkStore = useTextToLinkStore()

const router = useRouter();
const useText = ref(false);
const hideModal = ref(null);
const createProjectRef = ref(null);

const logout = (e) => {
    e.preventDefault();
    Echo.disconnect();
    localStorage.removeItem('token');
    router.push({
        name: 'login'
    })
}

const submitForm = () => {
  createProjectRef.value.submit();
  textToLinkStore.load();

}
</script>
