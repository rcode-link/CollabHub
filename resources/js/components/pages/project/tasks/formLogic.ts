export const setFormData = (form) => {
    const data = new FormData();
    data.append("project_id", form.project_id);
    data.append("name", form.name);
    data.append("description", JSON.stringify(form.description));
    form.related_tasks.map((obj, index) => {
        data.append(`related_tasks[${index}][task_id]`, obj.task.id);
        data.append(
            `related_tasks[${index}][task_relation_id]`,
            obj.task_relation_id
        );
    });

    form.tags.map((str, index) => {
        data.append(`tags[${index}]`, str);
    });

    if (form.due_date) {
        data.append("due_date", form.due_date);
    }
    if (form.user_id) {
        data.append("user_id", form.user_id.toString());
    }
    data.append("type_id", form.type_id.toString());

    if (form.files && form.files.length > 0) {
        form.files.forEach((obj, index) => {
            data.append(`file[${index}]`, obj);
        });
    }

    return data;
};
