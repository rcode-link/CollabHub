<script setup>
import InteractiveToast from "@/components/shared/InteractiveToast.vue";
import Button from "@/components/shared/Button.vue";
</script>

<template>
    <ul class="space-y-3">
        <li class="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800">
            <div>
                <p class="text-sm font-medium text-gray-900 dark:text-white">Delete account</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Permanently delete your account and all data</p>
            </div>
            <InteractiveToast type="red">
                <template #trigger>
                    <Button variant="danger" size="sm">Delete account</Button>
                </template>
                <template #title>Delete account</template>
                <template #content>Are you sure you want to permanently delete your account? This action cannot be undone.</template>
                <template #actions>
                    <Button variant="danger" size="sm">Confirm delete</Button>
                </template>
            </InteractiveToast>
        </li>
        <li class="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800">
            <div>
                <p class="text-sm font-medium text-gray-900 dark:text-white">Deactivate account</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Temporarily disable your account</p>
            </div>
            <InteractiveToast type="red">
                <template #trigger>
                    <Button variant="danger" size="sm">Deactivate account</Button>
                </template>
                <template #title>Deactivate account</template>
                <template #content>Are you sure you want to deactivate your account? You can reactivate it later.</template>
                <template #actions>
                    <Button variant="danger" size="sm">Confirm deactivate</Button>
                </template>
            </InteractiveToast>
        </li>
    </ul>
</template>
