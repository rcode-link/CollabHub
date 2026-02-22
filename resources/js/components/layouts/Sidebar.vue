<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
    FwbAvatar,
    FwbButton,
    FwbDropdown,
    FwbListGroup,
    FwbListGroupItem,
    FwbModal,
} from 'flowbite-vue'
import { Tippy } from 'vue-tippy'
import { useAbility } from '@casl/vue'
import { useUserStore } from '../../store/user'
import { useTasksStore } from '../../store/tasksStore'
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

const { can } = useAbility()
const userStore = useUserStore()
const tasksStore = useTasksStore()
const router = useRouter()
const route = useRoute()

const sidebarOpen = ref(false)
const step = ref('main')
const transitionName = ref('slide-left')
const projects = ref([])
const projectSearch = ref('')
const currentProject = ref({ id: null, name: '' })

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

// New project modal
const newProjectModal = ref(false)
const saving = ref(false)
const newProject = reactive({ name: '', key: '' })

watch(() => newProject.name, (name) => {
    const words = name.trim().split(/\s+/).filter(Boolean)
    if (words.length === 1) {
        newProject.key = words[0].slice(0, 5).toUpperCase()
    } else {
        newProject.key = words.map(w => w[0]).join('').slice(0, 5).toUpperCase()
    }
})

const openNewProject = () => {
    newProject.name = ''
    newProject.key = ''
    newProjectModal.value = true
}

const createProject = () => {
    if (!newProject.name.trim() || !newProject.key.trim()) return
    saving.value = true
    window.axios.post('/api/v1/projects', { ...newProject }).then(res => {
        newProjectModal.value = false
        loadProjects()
        router.push({ name: 'project-details', params: { project: res.data.id } })
    }).finally(() => {
        saving.value = false
    })
}

const handleOpenProject = (obj) => {
    localStorage.setItem('lastProject', obj.id)
    goToProjectStep(obj)
    sidebarOpen.value = false
    router.push({ name: 'project.board.view', params: { project: obj.id } })
}

const goToProjects = () => {
    transitionName.value = 'slide-left'
    step.value = 'projects'
}

const goToMain = () => {
    transitionName.value = 'slide-right'
    step.value = 'main'
}

const goToProjectStep = (project) => {
    currentProject.value = project
    transitionName.value = 'slide-left'
    step.value = 'project'
}

const backFromProject = () => {
    transitionName.value = 'slide-right'
    step.value = 'projects'
}

const closeSidebar = () => {
    sidebarOpen.value = false
}

// Auto-activate project step based on current route
watch(() => route.params.project, (projectId) => {
    if (!projectId) {
        if (step.value === 'project') step.value = 'main'
        return
    }
    const found = projects.value.find(p => String(p.id) === String(projectId))
    if (found) {
        currentProject.value = found
    } else {
        window.axios.get(`/api/v1/projects/${projectId}`).then(res => {
            currentProject.value = res.data
        })
    }
    step.value = 'project'
}, { immediate: true })

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
        class="fixed inset-0 z-50 bg-black bg-opacity-50 lg:hidden"
        @click="sidebarOpen = false"
    />

    <!-- Mobile header bar -->
    <header class="fixed top-0 left-0 right-0 z-40 h-14 lg:hidden flex items-center gap-3 px-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <router-link :to="{ name: 'home' }" class="flex items-center gap-2 no-underline min-w-0" @click="closeSidebar">
            <fwb-avatar :img="userStore.company.avatar" size="sm" />
            <span class="font-extrabold text-gray-900 dark:text-white truncate text-sm">
                {{ userStore.company.name }}
            </span>
        </router-link>

        <button
            class="ml-auto relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            @click="sidebarOpen = true"
        >
            <span class="sr-only">Open sidebar</span>
            <MenuIcon class="w-5 h-5" />
            <span
                v-if="userStore.newMessages"
                class="absolute -top-1 -right-1 w-4 h-4 text-xs bg-red-600 text-white flex items-center justify-center rounded-full font-bold"
            >
                {{ userStore.newMessages }}
            </span>
        </button>
    </header>

    <!-- Sidebar -->
    <aside
        :class="[
            'fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-200',
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
            <!-- Close button — mobile only, inside sidebar -->
            <button
                class="ml-auto lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                @click="sidebarOpen = false"
            >
                <span class="sr-only">Close sidebar</span>
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <!-- New task CTA — always visible across all steps -->
        <div class="px-3 pt-3 pb-1 flex-shrink-0">
            <button
                @click="tasksStore.toggleCreateTaskModal(); closeSidebar()"
                class="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 active:bg-blue-700"
            >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                New task
            </button>
        </div>

        <!-- Navigation (multistep) -->
        <div class="flex-1 overflow-hidden relative">
            <Transition :name="transitionName">

                <!-- Step: Main -->
                <nav v-if="step === 'main'" key="main" class="absolute inset-0 overflow-y-auto px-3 py-4 space-y-1">
                    <router-link :to="{ name: 'home' }" class="sidebar-nav-link" @click="closeSidebar">
                        <HomeIcon class="w-5 h-5 flex-shrink-0" />
                        <span>Home</span>
                    </router-link>

                    <router-link :to="{ name: 'chat' }" class="sidebar-nav-link" @click="closeSidebar">
                        <ChatIcon class="w-5 h-5 flex-shrink-0" />
                        <span>Chat</span>
                        <span
                            v-if="userStore.newMessages"
                            class="ml-auto inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 text-xs font-bold text-white bg-red-600 rounded-full"
                        >
                            {{ userStore.newMessages }}
                        </span>
                    </router-link>

                    <router-link :to="{ name: 'documents' }" class="sidebar-nav-link" @click="closeSidebar">
                        <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Documents</span>
                    </router-link>

                    <button type="button" class="sidebar-nav-link w-full" @click="goToProjects">
                        <ArchiveBoxIcon class="w-5 h-5 flex-shrink-0" />
                        <span>Projects</span>
                        <svg class="ml-auto w-4 h-4 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

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

                <!-- Step: Project -->
                <nav v-else-if="step === 'project'" key="project" class="absolute inset-0 overflow-y-auto px-3 py-4 space-y-1">
                    <!-- Back + project name -->
                    <div class="flex items-center gap-2 mb-4 px-1">
                        <button
                            class="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
                            @click="backFromProject"
                        >
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <span class="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {{ currentProject.name }}
                        </span>
                    </div>

                    <router-link
                        :to="{ name: 'project.board.view', params: { project: currentProject.id } }"
                        class="sidebar-nav-link"
                        @click="closeSidebar"
                    >
                        <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                        </svg>
                        <span>Boards</span>
                    </router-link>

                    <router-link
                        :to="{ name: 'project.tasks', params: { project: currentProject.id } }"
                        class="sidebar-nav-link"
                        @click="closeSidebar"
                    >
                        <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        <span>Backlog</span>
                    </router-link>

                    <router-link
                        :to="{ name: 'project.documents', params: { project: currentProject.id } }"
                        class="sidebar-nav-link"
                        @click="closeSidebar"
                    >
                        <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Documents</span>
                    </router-link>

                    <router-link
                        :to="{ name: 'project.documents.settings', params: { project: currentProject.id } }"
                        class="sidebar-nav-link"
                        @click="closeSidebar"
                    >
                        <CogsIcon class="w-5 h-5 flex-shrink-0" />
                        <span>Settings</span>
                    </router-link>
                </nav>

                <!-- Step: Projects -->
                <nav v-else key="projects" class="absolute inset-0 overflow-y-auto px-3 py-4 space-y-1">
                    <!-- Back + header -->
                    <div class="flex items-center gap-2 mb-3">
                        <button
                            class="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            @click="goToMain"
                        >
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <span class="text-sm font-semibold text-gray-900 dark:text-white">Projects</span>
                        <button
                            @click="openNewProject"
                            class="ml-auto flex items-center gap-1 rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white transition hover:bg-blue-500"
                        >
                            <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                            </svg>
                            New
                        </button>
                    </div>

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
                        class="sidebar-nav-link"
                        @click="handleOpenProject(proj)"
                    >
                        <span class="truncate">{{ proj.name }}</span>
                    </router-link>

                    <div v-if="filteredProjects.length === 0" class="text-xs text-gray-400 px-3 py-1.5">
                        No projects found
                    </div>
                </nav>

            </Transition>
        </div>

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

    <!-- New project modal -->
    <fwb-modal v-if="newProjectModal" @close="newProjectModal = false">
        <template #header>
            <h2 class="text-base font-semibold">New project</h2>
        </template>
        <template #body>
            <div class="space-y-4">
                <div>
                    <label class="block mb-1.5 text-sm font-medium text-gray-900 dark:text-white">Project name</label>
                    <input
                        v-model="newProject.name"
                        placeholder="e.g. Marketing Website"
                        @keydown.enter="createProject"
                        class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label class="block mb-1.5 text-sm font-medium text-gray-900 dark:text-white">
                        Project key
                        <span class="ml-1 text-xs font-normal text-gray-400">(document prefix)</span>
                    </label>
                    <input
                        v-model="newProject.key"
                        placeholder="e.g. MKT"
                        @keydown.enter="createProject"
                        class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white font-mono placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <p class="mt-1 text-xs text-gray-400">Short uppercase identifier, unique per project</p>
                </div>
            </div>
        </template>
        <template #footer>
            <fwb-button
                @click="createProject"
                :disabled="!newProject.name.trim() || !newProject.key.trim() || saving"
            >
                {{ saving ? 'Creating…' : 'Create project' }}
            </fwb-button>
            <fwb-button color="alternative" @click="newProjectModal = false">Cancel</fwb-button>
        </template>
    </fwb-modal>
</template>

<style scoped>
/* Forward: main → projects */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
    transition: transform 0.22s ease, opacity 0.22s ease;
}

.slide-left-enter-from  { transform: translateX(100%); opacity: 0; }
.slide-left-leave-to    { transform: translateX(-100%); opacity: 0; }

/* Back: projects → main */
.slide-right-enter-from { transform: translateX(-100%); opacity: 0; }
.slide-right-leave-to   { transform: translateX(100%); opacity: 0; }
</style>
