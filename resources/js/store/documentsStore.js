import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useDocumentsStore = defineStore('documents', () => {
    const documents = ref([])
    const projects = ref([])

    const loadDocuments = () => {
        Promise.all([
            axios.get('/api/v1/projects'),
            axios.get('/api/v1/files', { params: { global: true } }),
        ]).then(([projectsRes, filesRes]) => {
            projects.value = projectsRes.data.data ?? []
            buildTree(filesRes.data)
        })
    }

    const buildTree = (files) => {
        // Synthetic project folder for each project
        const projectFolders = projects.value.map(proj => ({
            id: `proj_${proj.id}`,
            title: proj.name,
            type: 'project-folder',
            parent_id: null,
            entity_id: proj.id,
            entity_type: 'project',
            file_id: null,
            updated_at: null,
        }))

        // Remap root-level project files to sit under their project folder.
        // Files with parent_id === null and entity_id !== null are root within their project.
        const remapped = files.map(file => {
            const normalized = {
                ...file,
                entity_type: file.entity_type ? 'project' : null,
            }
            if (file.parent_id === null && file.entity_id !== null) {
                return { ...normalized, parent_id: `proj_${file.entity_id}` }
            }
            return normalized
        })

        documents.value = [...projectFolders, ...remapped]
    }

    const getDocuments = computed(() => documents.value)

    return { loadDocuments, getDocuments }
})
