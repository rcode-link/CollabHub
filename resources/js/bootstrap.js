/**
 * We'll load the axios HTTP library which allows us to easily issue requests
 * to our Laravel back-end. This library automatically handles sending the
 * CSRF token as a header based on the value of the "XSRF" token cookie.
 */

import "flowbite";
import "../css/app.css";
import axios from "axios";
import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.env = JSON.parse(
    document.getElementById("app").getAttribute("data-env")
);

window.Pusher = Pusher;
window.axios = axios;

window.axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

let currentTheme = localStorage.getItem("color-theme");

if (!currentTheme) {
    currentTheme = "light";
    localStorage.setItem("color-theme", currentTheme);
}
document.getElementsByTagName("html")[0].classList.add(currentTheme);

if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme:dark)").matches &&
    currentTheme === "auto"
) {
    document.getElementsByTagName("html")[0].classList.add("dark");
} else {
    document.getElementsByTagName("html")[0].classList.add("light");
}
window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (event) => {
        document.getElementsByTagName("html")[0].classList.remove("dark");
        document.getElementsByTagName("html")[0].classList.remove("light");
        document
            .getElementsByTagName("html")[0]
            .classList.add(event.matches ? "dark" : "light");
    });

export function initEcho() {
    window.Echo = new Echo({
        broadcaster: "pusher",
        key: window.env.VITE_PUSHER_APP_KEY,
        cluster: window.env.VITE_PUSHER_APP_CLUSTER ?? "mt1",
        wsHost: window.env.VITE_PUSHER_HOST
            ? window.env.VITE_PUSHER_HOST
            : `ws-${window.env.VITE_PUSHER_APP_CLUSTER}.pusher.com`,
        wsPort: window.env.VITE_PUSHER_PORT ?? 80,
        wssPort: window.env.VITE_PUSHER_PORT ?? 443,
        forceTLS: (window.env.VITE_PUSHER_SCHEME ?? "https") === "https",
        encrypted: true,
        enabledTransports: ["ws", "wss"],
        authEndpoint: "/api/v1/pusher/auth",
        auth: {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "X-CSRF-TOKEN": document
                    .querySelector('[name="token"]')
                    .getAttribute("content"),
            },
        },
    });
}
