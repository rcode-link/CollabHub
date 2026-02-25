<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useUserStore } from '@/store/user'
import Button from '@/components/shared/Button.vue'
import { useObjectUrl } from '@vueuse/core'
import useInit from '@/functions/useInit.js'
import { toast } from 'vue3-toastify'

const userStore = useUserStore()
const fileInput = ref(null)
const form = reactive({
    avatar: null,
    preview: null,
})

const uploadImage = event => {
    form.avatar = event.target.files[0]
    form.preview = useObjectUrl(event.target.files[0])
}
const submit = () => {
    const formData = new FormData()

    if (form.avatar) {
        formData.append('avatar', form.avatar)
    }

    axios.post(`/api/v1/user/update-profile-picture`, formData).then(() => {
        toast.success(`Profile picture updated`, {
            theme: localStorage.getItem('color-theme') ?? 'light',
        })
        useInit()
    })
}

onMounted(() => {
    form.preview = userStore.user.avatar
})
</script>
<template>
    <form class="w-full grid gap-6" @submit.prevent="submit">
        <div class="flex flex-col items-center gap-4">
            <div class="relative">
                <img
                    v-if="form.preview"
                    :src="form.preview"
                    alt="Profile picture"
                    class="w-28 h-28 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                />
                <div
                    v-else
                    class="w-28 h-28 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
                >
                    <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
            </div>
            <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="uploadImage"
            />
            <Button type="button" variant="soft" @click="fileInput.click()">
                Choose photo
            </Button>
        </div>
        <Button type="submit">Save</Button>
    </form>
</template>
