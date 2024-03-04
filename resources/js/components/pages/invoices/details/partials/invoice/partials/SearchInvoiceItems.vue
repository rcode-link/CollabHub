<script lang="js" setup>
import { onMounted, ref } from "vue";
import AutoComplete from "@/components/shared/AutoComplete.vue";
import { useRoute } from "vue-router";
import Label from "@/components/shared/Label.vue";

        const itemList = ref([]);
        const route = useRoute();
        const searchItems = (val) => {
            console.log(val);
            load();
        };

        const load = () => {
            window.axios.get("/api/v1/billing-items").then((res) => {
                itemList.value = res.data.data;
            });
        };

        const selected = (val) => {
            window.axios.post(`/api/v1/invoices-items`, {
                item_id: val,
                invoice_id: route.params.inv_id,
            });
        };
</script>

<template>
    <div>
        <Label for-input="items">Select item</Label>
        <AutoComplete
            name="items"
            :items="
                itemList.map((obj) => {
                    return {
                        label: obj.name,
                        value: obj.id,
                    };
                })
            "
            :key="itemList.length"
            @search="searchItems"
            @selected="selected"
        />
    </div>
</template>
