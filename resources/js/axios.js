import axios from "axios";
import { toast } from "vue3-toastify";
import { useErrorsStore } from "./store/errors";

export const initAxios = () => {
    const errorsStore = useErrorsStore();
    const onRequest = (config) => {
        if (import.meta.env.DEV) {
            if (!config.url) {
                config.url += "?XDEBUG_SESSION_START=PHPSTORM";
            } else {
                config.url.indexOf("?") > -1
                    ? "&XDEBUG_SESSION_START=PHPSTORM"
                    : "?XDEBUG_SESSION_START=PHPSTORM";
            }
        }
        errorsStore.setErrors([], "");
        return config;
    };
    const instance = axios.create({
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
    instance.interceptors.request.use(onRequest, function (error) {
        return error;
    });
    instance.interceptors.response.use(
        function (response) {
            return response;
        },
        function (error) {
            if (
                error.response.status === 401 &&
                location.pathname !== "/login"
            ) {
                localStorage.removeItem("token");
                window.location.href = "/login";
            }
            if (error.response.status === 422) {
                errorsStore.setErrors(error.response.data.errors, "");
            }
            if (error.response.status === 403) {
                toast.error("You are not authorized to preform this action", {
                    //@ts-ignore
                    theme: localStorage.getItem("color-theme") ?? "light",
                });
            }
            if (error.response.status === 500) {
                toast.error(
                    "Someting went wrong, plese contact system administrator",
                    {
                        //@ts-ignore
                        theme: localStorage.getItem("color-theme") ?? "light",
                    }
                );
            }
            return Promise.reject(error);
        }
    );
    window.axios = instance;
};
