<script setup>
import { onMounted, ref } from "vue";
import {
    FwbButton,
    FwbTable,
    FwbTableBody,
    FwbTableCell,
    FwbTableHead,
    FwbTableHeadCell,
    FwbTableRow,
} from "flowbite-vue";
import UserIcon from "../../../shared/UserIcon.vue";
import { useRoute, useRouter } from "vue-router";
import { useBreadcrumbStore } from "../../../../store/breadcrumb";
import InteractiveToast from "../../../shared/InteractiveToast.vue";
import Card from "../../../shared/Card.vue";

const route = useRoute();
const router = useRouter();
const breadcrumbStore = useBreadcrumbStore();

onMounted(() => {
    breadcrumbStore.addEntry([
        {
            title: "Settings",
        },
    ]);
});
</script>

<template>
    <div class="grid grid-cols-3 gap-4">
        <div>
            <Card>
                <ul>
                    <li>
                        <router-link :to="{ name: 'project.settings.users' }"
                            >Users</router-link
                        >
                    </li>
                    <li>
                        <router-link :to="{ name: 'project.settings.security' }"
                            >Security</router-link
                        >
                    </li>
                </ul>
            </Card>
        </div>
        <div class="col-span-2">
            <router-view></router-view>
        </div>
    </div>
</template>
