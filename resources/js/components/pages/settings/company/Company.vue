<script setup>
import Settings from "@/components/layouts/Settings.vue";
import { useObjectUrl } from "@vueuse/core";
import { useBreadcrumbStore } from "@/store/breadcrumb";
import Card from "@/components/shared/Card.vue";
import Label from "@/components/shared/Label.vue";
import Button from "@/components/shared/Button.vue";
import Text from "@/components/shared/Text.vue";
import Errors from "@/components/shared/Errors.vue";
import { reactive, ref, watch } from "vue";
import { useUserStore } from "@/store/user";
import useInit from "@/functions/useInit";
import { useAbility } from "@casl/vue";
import { toast } from "vue3-toastify";
const { can } = useAbility();

const userStore = useUserStore();
const fileInput = ref(null);
const form = reactive({
    company: {},
    avatar: null,
});

watch(
    () => userStore.company,
    () => {
        form.company = userStore.company;
    },
    {
        deep: true,
        immediate: true,
    }
);
const breadcrumb = useBreadcrumbStore();
breadcrumb.setLinks([
    {
        link: "/",
        title: "Home",
    },
    {
        link: {
            name: "settings.base",
        },
        title: "Settings",
    },
    {
        title: "Company",
    },
]);

const uploadImage = (event) => {
    form.avatar = event.target.files[0];
    form.company.avatar = useObjectUrl(event.target.files[0]);
};

const submit = () => {
    if (!can(`can-update-company.${userStore.company.id}`)) {
        return;
    }

    const formData = new FormData();

    formData.append("name", form.company.name);
    if (form.avatar) {
        formData.append("avatar", form.avatar);
    }

    axios.post(`/api/v1/companies/${form.company.id}`, formData).then(() => {
        toast.success("Company updated", {
            theme: localStorage.getItem("color-theme") ?? "light",
        });
        useInit();
    });
};
</script>

<template>
    <Settings>
        <Card>
            <div class="p-5">
                <form @submit.prevent="submit" class="w-full grid gap-6">
                    <div>
                        <Label forInput="name">Company Name</Label>
                        <Text
                            type="text"
                            v-model="form.company.name"
                            :disabled="
                                !can(
                                    `can-update-company.${userStore.company.id}`
                                )
                            "
                            name="name"
                            placeholder="Company name"
                        />
                        <Errors name="name" />
                    </div>
                    <div class="flex flex-col items-center gap-4">
                        <div class="relative">
                            <img
                                v-if="form.company.avatar"
                                :src="form.company.avatar"
                                alt="Company logo"
                                class="w-28 h-28 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                            />
                            <div
                                v-else
                                class="w-28 h-28 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
                            >
                                <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                        </div>
                        <input
                            ref="fileInput"
                            v-if="can(`can-update-company.${userStore.company.id}`)"
                            type="file"
                            accept="image/*"
                            class="hidden"
                            @change="uploadImage"
                        />
                        <Button
                            v-if="can(`can-update-company.${userStore.company.id}`)"
                            type="button"
                            variant="soft"
                            @click="fileInput.click()"
                        >
                            Choose logo
                        </Button>
                    </div>

                    <Button
                        v-if="can(`can-update-company.${userStore.company.id}`)"
                        type="submit"
                    >
                        Save
                    </Button>
                </form>
            </div>
        </Card>
    </Settings>
</template>
