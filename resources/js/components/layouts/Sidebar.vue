<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
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
import { useUserStore } from '@/store/user'
import { useTasksStore } from '@/store/tasksStore'
import HomeIcon from '@/components/shared/icons/HomeIcon.vue'
import ChatIcon from '@/components/shared/icons/ChatIcon.vue'
import BanknotesIcon from '@/components/shared/icons/BanknotesIcon.vue'
import ChartPieIcon from '@/components/shared/icons/ChartPieIcon.vue'
import ArchiveBoxIcon from '@/components/shared/icons/ArchiveBoxIcon.vue'
import SunIcon from '@/components/shared/icons/SunIcon.vue'
import MoonIcon from '@/components/shared/icons/MoonIcon.vue'
import ComputerIcon from '@/components/shared/icons/ComputerIcon.vue'
import MenuIcon from '@/components/shared/icons/MenuIcon.vue'
import { debounce } from '@/functions/debounce'
import SearchSelect from '@/components/shared/ui/SearchSelect.vue'

const { can } = useAbility()
const userStore = useUserStore()
const tasksStore = useTasksStore()
const router = useRouter()
const route = useRoute()

// ---- Timer ----
const timerStart = ref(localStorage.getItem('timer_start') || null)
const elapsed = ref('')
let timerInterval = null

const isTimerRunning = computed(() => Boolean(timerStart.value))

const formatElapsed = (ms) => {
    const totalSec = Math.floor(ms / 1000)
    const h = Math.floor(totalSec / 3600)
    const m = Math.floor((totalSec % 3600) / 60)
    const s = totalSec % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const tickTimer = () => {
    if (!timerStart.value) { elapsed.value = ''; return }
    elapsed.value = formatElapsed(Date.now() - new Date(timerStart.value).getTime())
}

const startTimerTick = () => {
    clearInterval(timerInterval)
    tickTimer()
    timerInterval = setInterval(tickTimer, 1000)
}

const startTimer = () => {
    const now = new Date().toISOString()
    localStorage.setItem('timer_start', now)
    timerStart.value = now
    startTimerTick()
}

// Stop timer modal
const showStopModal = ref(false)
const stopProjects = ref([])
const stopProjectId = ref('')
const stopTasks = ref([])
const stopTaskId = ref('')
const stopTaskSearch = ref('')
const stopSaving = ref(false)

const openStopModal = () => {
    showStopModal.value = true
    stopProjectId.value = ''
    stopTaskId.value = ''
    stopTasks.value = []
    stopTaskSearch.value = ''
    window.axios.get('/api/v1/projects').then(res => {
        stopProjects.value = res.data.data ?? res.data ?? []
    })
}

const stopProjectOptions = computed(() =>
    stopProjects.value.map(p => ({ value: p.id, label: p.name }))
)

watch(stopProjectId, (id) => {
    stopTaskId.value = ''
    stopTasks.value = []
    stopTaskSearch.value = ''
    if (id) searchStopTasks('')
})

const searchStopTasks = (val) => {
    if (!stopProjectId.value) return
    window.axios.get('/api/v1/tasks/search', {
        params: { project_id: stopProjectId.value, search: val }
    }).then(res => { stopTasks.value = res.data.data ?? [] })
}

watch(stopTaskSearch, debounce((val) => searchStopTasks(val), 300))

const submitStopTimer = () => {
    if (!stopTaskId.value || !stopProjectId.value || !timerStart.value) return
    stopSaving.value = true
    window.axios.post('/api/v1/time-sheet', {
        start: timerStart.value,
        end: new Date().toISOString(),
        task_id: stopTaskId.value,
        project_id: stopProjectId.value,
    }).then(() => {
        localStorage.removeItem('timer_start')
        timerStart.value = null
        elapsed.value = ''
        clearInterval(timerInterval)
        showStopModal.value = false
    }).finally(() => { stopSaving.value = false })
}

const cancelStopModal = () => { showStopModal.value = false }

onMounted(() => { if (timerStart.value) startTimerTick() })
onUnmounted(() => { clearInterval(timerInterval) })

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
    if (window.CollabHubAndroid) {
        try { window.CollabHubAndroid.clearCredentials() } catch (e) {}
    }
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
    <header class="fixed top-0 left-0 right-0 z-40 lg:hidden flex items-center gap-3 px-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700" style="padding-top: env(safe-area-inset-top, 0px); height: calc(3.5rem + env(safe-area-inset-top, 0px))">
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
        style="padding-top: env(safe-area-inset-top, 0px)"
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

        <!-- Quick actions — always visible across all steps -->
        <div class="px-3 pt-3 pb-1 flex-shrink-0 space-y-2">
            <div class="flex gap-1.5">
                <!-- New task -->
                <button
                    @click="tasksStore.toggleCreateTaskModal(); closeSidebar()"
                    class="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-2 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-500 active:bg-blue-700"
                    title="New task"
                >
                    <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <span class="hidden xl:inline">Task</span>
                </button>

                <!-- Start / Stop timer -->
                <button
                    v-if="!isTimerRunning"
                    @click="startTimer"
                    class="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-2 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500 active:bg-emerald-700"
                    title="Start timer"
                >
                    <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
                    </svg>
                    <span class="hidden xl:inline">Timer</span>
                </button>
                <button
                    v-else
                    @click="openStopModal"
                    class="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-red-600 px-2 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-red-500 active:bg-red-700 animate-pulse"
                    title="Stop timer"
                >
                    <svg class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <rect x="6" y="6" width="12" height="12" rx="2" />
                    </svg>
                    <span class="hidden xl:inline">Stop</span>
                </button>

                <!-- Go home -->
                <button
                    @click="router.push({ name: 'home' }); closeSidebar()"
                    class="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 shadow-sm transition hover:bg-gray-50 dark:hover:bg-gray-600"
                    title="Go home"
                >
                    <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
                    </svg>
                    <span class="hidden xl:inline">Home</span>
                </button>
            </div>

            <!-- Timer display when running -->
            <div
                v-if="isTimerRunning"
                class="flex items-center justify-center gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-1.5 cursor-pointer"
                @click="openStopModal"
            >
                <div class="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0"></div>
                <span class="text-xs font-mono font-bold text-red-600 dark:text-red-400">{{ elapsed }}</span>
                <span class="text-xs text-red-500 dark:text-red-400">recording</span>
            </div>
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
                        :to="{ name: 'project.settings', params: { project: currentProject.id } }"
                        class="sidebar-nav-link"
                        @click="closeSidebar"
                    >
                        <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37 1 .608 2.296.07 2.573-1.066z" />
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
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
                <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37 1 .608 2.296.07 2.573-1.066z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
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

    <!-- Stop timer modal -->
    <Teleport to="body">
        <Transition name="taskmodal">
            <div v-if="showStopModal" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="cancelStopModal" />
                <div class="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <!-- Header -->
                    <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                        <div>
                            <h2 class="text-sm font-semibold text-gray-900 dark:text-white">Stop Timer</h2>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                Tracked <span class="font-mono font-bold text-red-500">{{ elapsed }}</span>
                            </p>
                        </div>
                        <button @click="cancelStopModal" class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>

                    <!-- Body -->
                    <div class="px-5 py-4 space-y-4">
                        <!-- Project selector -->
                        <div>
                            <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Project</label>
                            <SearchSelect
                                v-model="stopProjectId"
                                :options="stopProjectOptions"
                                placeholder="Select project"
                                search-placeholder="Search projects..."
                            />
                        </div>

                        <!-- Task search + selection -->
                        <div>
                            <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Task</label>
                            <input
                                v-model="stopTaskSearch"
                                type="text"
                                :disabled="!stopProjectId"
                                :placeholder="stopProjectId ? 'Search tasks...' : 'Select a project first'"
                                class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <div class="h-48 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700">
                                <button
                                    v-for="task in stopTasks"
                                    :key="task.id"
                                    @click="stopTaskId = task.id"
                                    class="flex items-center gap-2 w-full px-3 py-2 text-left text-sm transition-colors"
                                    :class="stopTaskId === task.id
                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'"
                                >
                                    <span class="font-mono text-xs text-gray-400 flex-shrink-0">{{ task.task_id }}</span>
                                    <span class="truncate">{{ task.name }}</span>
                                    <svg v-if="stopTaskId === task.id" class="w-4 h-4 ml-auto text-blue-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                                    </svg>
                                </button>
                                <p v-if="!stopTasks.length" class="text-xs text-gray-400 dark:text-gray-500 px-3 py-3 text-center">
                                    {{ stopProjectId ? 'No tasks found' : 'Tasks will appear here once you pick a project' }}
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                        <button
                            @click="cancelStopModal"
                            class="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >Cancel</button>
                        <button
                            @click="submitStopTimer"
                            :disabled="!stopTaskId || stopSaving"
                            class="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <svg v-if="stopSaving" class="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 12a9 9 0 11-6.219-8.56"/>
                            </svg>
                            Save time entry
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>

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
/* Stop timer modal */
.taskmodal-enter-active, .taskmodal-leave-active {
    transition: opacity 0.15s ease;
}
.taskmodal-enter-from, .taskmodal-leave-to {
    opacity: 0;
}

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
