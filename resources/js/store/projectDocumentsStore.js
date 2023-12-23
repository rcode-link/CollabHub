import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {useRoute} from "vue-router";

export const useProjectDocumentsStore =
    defineStore('projectDocuments', () => {

        const route = useRoute();
        const documents = ref([]);

        const loadDocuments = () => {
            axios.get(`/api/v1/files`, {
                params: {
                    entity_id: route.params.project
                }
            }).then(res => addDocuments(res.data))
        }
        const addDocuments = (list) => {
            documents.value = list;
        }
        const getDocuments = computed(() => documents.value);

        return {
            addDocuments,
            loadDocuments,
            getDocuments,
        }

    });
