<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
    FwbAvatar,
    FwbButton,
    FwbDropdown,
    FwbListGroup,
    FwbListGroupItem,
} from 'flowbite-vue'
import { Tippy } from 'vue-tippy'
import { useAbility } from '@casl/vue'
import { useUserStore } from '../../store/user'
import HomeIcon from '../shared/icons/HomeIcon.vue'
import ChatIcon from '../shared/icons/ChatIcon.vue'
import BanknotesIcon from '../shared/icons/BanknotesIcon.vue'
import ChartPieIcon from '../shared/icons/ChartPieIcon.vue'
import ArchiveBoxIcon from '../shared/icons/ArchiveBoxIcon.vue'
import CogsIcon from '../shared/icons/CogsIcon.vue'
import SunIcon from '../shared/icons/SunIcon.vue'
import MoonIcon from '../shared/icons/MoonIcon.vue'
import ComputerIcon from '../shared/icons/ComputerIcon.vue'
import MenuIcon from '../shared/icons/MenuIcon.vue'
import ArrowDownIcon from '../shared/icons/ArrowDownIcon.vue'

const { can } = useAbility()
const userStore = useUserStore()
const router = useRouter()

const sidebarOpen = ref(false)
const projectsOpen = ref(false)
const projects = ref([])
const projectSearch = ref('')

const filteredProjects = computed(() =>
    projects.value.filter(obj =>
        obj.name.toLowerCase().includes(projectSearch.value.toLowerCase())
    )
)

const loadProjects = () => {
    window.axios.get('/api/v1/projects').then(res => {
        projects.value = res.data.data ?? []
    })
}

onMounted(() => {
    loadProjects()
})

const handleOpenProject = (obj) => {
    localStorage.setItem('lastProject', obj.id)
    sidebarOpen.value = false
    router.push({ name: 'project.board.view', params: { project: obj.id } })
}

const closeSidebar = () => {
    sidebarOpen.value = false
}

const logout = (e) => {
    e.preventDefault()
    window.Echo.disconnect()
    localStorage.removeItem('token')
    window.axios.post('/api/v1/logout').then(() => {
        router.push({ name: 'login' })
    })
}

const html = document.getElementsByTagName('html')[0]
const currentTheme = ref(localStorage.getItem('color-theme') || 'auto')

const changeTheme = (theme) => {
    html.classList.remove(currentTheme.value)
    currentTheme.value = theme
    if (theme !== 'auto') {
        html.classList.add(theme)
    }
    localStorage.setItem('color-theme', theme)
}
</script>

<template>
    <!-- Mobile overlay -->
    <div
        v-if="sidebarOpen"
        class="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
        @click="sidebarOpen = false"
    />

    <!-- Mobile hamburger toggle -->
    <button
        class="fixed top-3 left-3 z-40 lg:hidden p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
        @click="sidebarOpen = !sidebarOpen"
    >
        <span class="sr-only">Toggle sidebar</span>
        <MenuIcon class="w-5 h-5 text-gray-600 dark:text-gray-300" />
        <span
            v-if="userStore.newMessages"
            class="absolute -top-1 -right-1 w-4 h-4 text-xs bg-red-600 text-white flex items-center justify-center rounded-full font-bold"
        >
            {{ userStore.newMessages }}
        </span>
    </button>

    <!-- Sidebar -->
    <aside
        :class="[
            'fixed inset-y-0 left-0 z-30 w-64 flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-200',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        ]"
    >
        <!-- Logo / Company -->
        <div class="flex items-center gap-3 px-4 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <router-link :to="{ name: 'home' }" class="flex items-center gap-2 no-underline" @click="closeSidebar">
                <fwb-avatar :img="userStore.company.avatar" size="sm" />
                <span class="font-extrabold text-gray-900 dark:text-white truncate text-sm">
                    {{ userStore.company.name }}
                </span>
            </router-link>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            <router-link
                :to="{ name: 'home' }"
                class="sidebar-nav-link"
                @click="closeSidebar"
            >
                <HomeIcon class="w-5 h-5 flex-shrink-0" />
                <span>Home</span>
            </router-link>

            <router-link
                :to="{ name: 'chat' }"
                class="sidebar-nav-link"
                @click="closeSidebar"
            >
                <ChatIcon class="w-5 h-5 flex-shrink-0" />
                <span>Chat</span>
                <span
                    v-if="userStore.newMessages"
                    class="ml-auto inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 text-xs font-bold text-white bg-red-600 rounded-full"
                >
                    {{ userStore.newMessages }}
                </span>
            </router-link>

            <!-- Projects collapsible -->
            <div>
                <button
                    type="button"
                    class="sidebar-nav-link w-full"
                    @click="projectsOpen = !projectsOpen"
                >
                    <ArchiveBoxIcon class="w-5 h-5 flex-shrink-0" />
                    <span>Projects</span>
                    <ArrowDownIcon
                        :class="[
                            'ml-auto w-4 h-4 flex-shrink-0 transition-transform duration-150',
                            projectsOpen ? 'rotate-180' : ''
                        ]"
                    />
                </button>
                <div v-if="projectsOpen" class="mt-1 ml-4 space-y-1">
                    <input
                        v-model="projectSearch"
                        type="text"
                        placeholder="Search projects..."
                        class="w-full text-xs px-2 py-1.5 mb-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <router-link
                        v-for="proj in filteredProjects"
                        :key="proj.id"
                        :to="{ name: 'project.board.view', params: { project: proj.id } }"
                        class="sidebar-nav-link text-sm py-1.5"
                        @click="handleOpenProject(proj)"
                    >
                        <span class="truncate">{{ proj.name }}</span>
                    </router-link>
                    <div v-if="filteredProjects.length === 0" class="text-xs text-gray-400 px-3 py-1.5">
                        No projects found
                    </div>
                </div>
            </div>

            <router-link
                v-if="can(`can-view-billing-info.${userStore.company.id}`)"
                :to="{ name: 'invoices' }"
                class="sidebar-nav-link"
                @click="closeSidebar"
            >
                <BanknotesIcon class="w-5 h-5 flex-shrink-0" />
                <span>Invoices</span>
            </router-link>

            <router-link
                v-if="can(`can-see-timesheet-report.${userStore.company.id}`, '')"
                :to="{ name: 'reports' }"
                class="sidebar-nav-link"
                @click="closeSidebar"
            >
                <ChartPieIcon class="w-5 h-5 flex-shrink-0" />
                <span>Reports</span>
            </router-link>
        </nav>

        <!-- Bottom section -->
        <div class="border-t border-gray-200 dark:border-gray-700 px-3 py-4 space-y-2 flex-shrink-0">
            <!-- Theme switcher -->
            <div class="flex items-center gap-2 px-2 mb-3">
                <span class="text-xs text-gray-500 dark:text-gray-400 mr-1">Theme</span>
                <Tippy content="Light theme">
                    <fwb-button
                        size="xs"
                        :color="currentTheme === 'light' ? 'default' : 'alternative'"
                        @click="changeTheme('light')"
                    >
                        <SunIcon class="w-3.5 h-3.5" />
                    </fwb-button>
                </Tippy>
                <Tippy content="Dark theme">
                    <fwb-button
                        size="xs"
                        :color="currentTheme === 'dark' ? 'default' : 'alternative'"
                        @click="changeTheme('dark')"
                    >
                        <MoonIcon class="w-3.5 h-3.5" />
                    </fwb-button>
                </Tippy>
                <Tippy content="System theme">
                    <fwb-button
                        size="xs"
                        :color="currentTheme === 'auto' ? 'default' : 'alternative'"
                        @click="changeTheme('auto')"
                    >
                        <ComputerIcon class="w-3.5 h-3.5" />
                    </fwb-button>
                </Tippy>
            </div>

            <!-- Settings -->
            <router-link
                :to="{ name: 'settings.base' }"
                class="sidebar-nav-link"
                @click="closeSidebar"
            >
                <CogsIcon class="w-5 h-5 flex-shrink-0" />
                <span>Settings</span>
            </router-link>

            <!-- User info + logout dropdown -->
            <fwb-dropdown placement="top" class="w-full">
                <template #trigger>
                    <div class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer w-full">
                        <fwb-avatar :img="userStore.user.avatar" size="sm" />
                        <div class="flex-1 min-w-0">
                            <div class="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {{ userStore.user.name }}
                            </div>
                            <div class="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {{ userStore.user.email }}
                            </div>
                        </div>
                    </div>
                </template>
                <fwb-list-group class="w-52">
                    <fwb-list-group-item>
                        <a
                            href="#"
                            @click="logout"
                            class="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                        >
                            Sign out
                        </a>
                    </fwb-list-group-item>
                </fwb-list-group>
            </fwb-dropdown>
        </div>
    </aside>
</template>
