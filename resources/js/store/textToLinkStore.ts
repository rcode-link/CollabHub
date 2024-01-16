import { defineStore } from "pinia";
import { ref } from "vue";

export const useTextToLinkStore =
    defineStore('textToLinkStore', () => {
        const items = ref([]);

        const load = () => {
            window.axios.get('/api/v1/get-organization-keys').then(res => items.value = res.data);
        }

        return {
            items,
            load
        }
    });
