<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useUserStore } from '@/store/user'
import Button from '@/components/shared/Button.vue'
import { useObjectUrl } from '@vueuse/core'
import useInit from '@/functions/useInit.js'
import { toast } from 'vue3-toastify'

const userStore = useUserStore()
const fileInput = ref(null)
const uploading = ref(false)
const form = reactive({
    avatar: null,
    preview: null,
})

const uploadImage = event => {
    form.avatar = event.target.files[0]
    form.preview = useObjectUrl(event.target.files[0])
}

const submit = () => {
    if (!form.avatar) return
    uploading.value = true
    const formData = new FormData()
    formData.append('avatar', form.avatar)

    axios.post(`/api/v1/user/update-profile-picture`, formData).then(() => {
        toast.success('Profile picture updated', {
            theme: localStorage.getItem('color-theme') ?? 'light',
        })
        form.avatar = null
        useInit()
    }).finally(() => {
        uploading.value = false
    })
}

onMounted(() => {
    form.preview = userStore.user.avatar
})
</script>
<template>
    <div class="flex flex-col items-center gap-3 sm:items-start">
        <div class="relative group">
            <img
                v-if="form.preview"
                :src="form.preview"
                alt="Profile picture"
                class="w-24 h-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
            />
            <div
                v-else
                class="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
            >
                <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            </div>
            <button
                type="button"
                class="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center cursor-pointer"
                @click="fileInput.click()"
            >
                <svg class="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </button>
        </div>
        <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="uploadImage"
        />
        <div class="flex gap-2">
            <Button type="button" variant="soft" size="sm" @click="fileInput.click()">
                Change photo
            </Button>
            <Button v-if="form.avatar" size="sm" :disabled="uploading" @click="submit">
                {{ uploading ? 'Uploading...' : 'Upload' }}
            </Button>
        </div>
    </div>
</template>
