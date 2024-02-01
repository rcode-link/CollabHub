<script lang="ts" setup>
import { FwbButton } from "flowbite-vue";
import { useRoute } from "vue-router";
const route = useRoute();
const downloadInvoice = () => {
    window.axios
        .get(`/api/v1/invoices/${route.params.inv_id}/download`, {
            responseType: "blob",
        })
        .then((response) => {
            window.open(URL.createObjectURL(response.data));
        });
};

const markAsSent = () => {
    // sent
    window.axios.put(`/api/v1/invoices/${route.params.inv_id}`, {
        sent: true,
    });
};
</script>
<template>
    <fwb-button @click="downloadInvoice" color="green">Download</fwb-button>
    <fwb-button color="yellow">Record payment</fwb-button>
    <!-- <fwb-button>Send</fwb-button> -->
    <fwb-button @click="markAsSent" color="alternative"
        >Mark as sent</fwb-button
    >
</template>
