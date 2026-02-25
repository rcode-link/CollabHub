<template>
    <div>
        <h4
            class="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-3 mb-2"
        >
            Profile
        </h4>
        <nav class="space-y-0.5">
            <router-link
                :to="{ name: 'settings.base' }"
                class="sidebar-nav-link"
            >
                My profile
            </router-link>
        </nav>
    </div>
</template>
