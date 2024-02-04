<script setup>
import Settings from "../../../layouts/Settings.vue";
import Card from "../../../shared/Card.vue";
import ChangePassword from "./partials/ChangePassword.vue";
import BaseProfile from "./partials/BaseProfile.vue";
import { useBreadcrumbStore } from "../../../../store/breadcrumb";
import ProfilePicture from "./partials/ProfilePicture.vue";
import DeleteAccount from "./partials/DeleteAccount.vue";

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
        link: {
            name: "settings.base",
        },
        title: "Profile Settings",
    },
]);
</script>

<template>
    <Settings>
        <div class="w-full flex flex-col gap-4 mb-4">
            <Card class="flex-col gap-6">
                <h1 class="font-bold text-xl">Basic profile info</h1>
                <BaseProfile />
            </Card>
            <Card class="flex-col gap-6">
                <h1 class="font-bold text-xl">Profile Image</h1>
                <ProfilePicture />
            </Card>
            <Card class="flex-col gap-6">
                <h1 class="font-bold text-xl">Change Password</h1>
                <ChangePassword />
            </Card>

            <Card class="flex-col gap-6" color="bg-gray-100 dark:bg-gray-700">
                <h1 class="font-bold text-xl">Danger zone</h1>
                <DeleteAccount />
            </Card>
        </div>
    </Settings>
</template>

<style scoped></style>
