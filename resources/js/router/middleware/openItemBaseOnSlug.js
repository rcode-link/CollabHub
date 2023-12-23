export default function ({router, to}) {

    // check if slug contains -D- (meaning its document)
    const isDocument = to.params.slug.indexOf('-D-') > -1;

    if (isDocument) {
        axios.get(`/api/v1/files/${to.params.slug}`).then((res) => {
            const data = res.data;
            const route = {}
            switch (data.entity_type) {
                case 'App\\Models\\Project':
                    route.name = 'project.documents.editor'
                    route.params = {
                        project: data.entity_id,
                        id: to.params.slug
                    }
                    break;
            }

            router.push(route);
        }).catch(() => {
            router.push('/404')
        })
    } else {
        axios.get(`/api/v1/tasks/${to.params.slug}`).then((res) => {
            router.push({
                name: 'project.tasks',
                params: {
                    project: res.data.data.project_id,
                },
                query: {
                    task: to.params.slug
                }

            })
        }).catch(() => {
            router.push('/404')
        })
    }
}
