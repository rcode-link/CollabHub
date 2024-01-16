<script setup>

import Auth from "../../layouts/Auth.vue";
import {onMounted} from "vue";
import {FwbHeading, FwbImg, FwbP} from "flowbite-vue";
import Card from "../../shared/Card.vue";
import {useAbility} from "@casl/vue";
import {useUserStore} from "../../../store/user.js";
import AdminView from "./partials/AdminView.vue";
import {useSingleUserStore} from "../../../store/singleUser.js";
import UserInResources from "./UserInResources.vue";

const {can, rules} = useAbility()
const userStore = useUserStore();

const singleUserStore = useSingleUserStore();

onMounted(() => {
    singleUserStore.load();
})


</script>

<template>
    <Auth>
        <Card class="grid gap-4 grid-cols-4">
            <div>
                <fwb-img alt="" :src="`${singleUserStore.user.avatar}`"/>
            </div>
            <div class="col-span-3 flex flex-col gap-4">
                <fwb-heading tag="h1">
                    {{ singleUserStore.user.name }} <small class="text-sm">
                    {{ singleUserStore.user.deleted_at && singleUserStore.user.name !== 'deleted_user' ? '(deactivated)' : '' }}
                </small>
                </fwb-heading>

                <fwb-p>
                    Email: <a :href="`mailto:${singleUserStore.user.email}`">{{ singleUserStore.user.email }}</a>
                </fwb-p>

                <fwb-p>
                    Resources:
                    <div class="flex gap-4">
                        <UserInResources v-for="obj in singleUserStore.user.view_profile" :obj="obj"/>
                    </div>
                </fwb-p>
                <fwb-p>
                    Work time from: <b>{{ singleUserStore.user.start_work_time ?? '00:00' }} to:
                    {{ singleUserStore.user.end_work_time ?? '00:00' }}</b>
                </fwb-p>
                <AdminView class="mt-auto" v-if="can(`can-delete-users.${userStore.company.id}`)"/>
            </div>
        </Card>
    </Auth>
</template>

