import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useDocumentsStore = defineStore('documents', () => {
    const allDocuments = ref([])
    const projects = ref([])
    const search = ref('')

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
        // Only create project folders for projects that actually have files
        const projectIdsWithFiles = new Set(
            files.filter(f => f.entity_id !== null).map(f => f.entity_id)
        )

        const projectFolders = projects.value
            .filter(proj => projectIdsWithFiles.has(proj.id))
            .map(proj => ({
                id: `proj_${proj.id}`,
                title: proj.name,
                type: 'project-folder',
                parent_id: null,
                entity_id: proj.id,
                entity_type: 'project',
                file_id: null,
                updated_at: null,
            }))

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

        allDocuments.value = [...projectFolders, ...remapped]
    }

    const getDocuments = computed(() => {
        let items = allDocuments.value

        if (search.value.trim()) {
            const q = search.value.toLowerCase().trim()
            const matchIds = new Set(
                items.filter(i => i.title?.toLowerCase().includes(q)).map(i => i.id)
            )
            // Include ancestors so tree structure stays intact
            const keep = new Set(matchIds)
            for (const id of matchIds) {
                let current = items.find(i => i.id === id)
                while (current?.parent_id) {
                    keep.add(current.parent_id)
                    current = items.find(i => i.id === current.parent_id)
                }
            }
            items = items.filter(i => keep.has(i.id))
        }

        return items
    })

    return { loadDocuments, getDocuments, search }
})
