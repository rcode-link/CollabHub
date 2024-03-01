import { defineStore } from "pinia";

export const useErrorsStore = defineStore("errors", {
    state: () => ({ errors: {} }),
    actions: {
        setErrors(errors, form) {
            this.errors = errors;
        },
    },
    getters: {
        getErrors: (state) => {
            return (field, form) => {
                if (!state.errors.hasOwnProperty(form)) {
                    return {};
                }
                if (!state.errors[form].hasOwnProperty(field)) {
                    return {};
                }
                if (!form) {
                    return state.errors[field];
                }
                return state.errors[form][field];
            };
        },
    },
});
