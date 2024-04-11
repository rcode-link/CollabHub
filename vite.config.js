import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import vuePlugin from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
    plugins: [
        vuePlugin(),
        VitePWA({
            registerType: "autoUpdate",
            devOptions: {
                enabled: true,
            },
        }),
        laravel({
            input: ["resources/css/app.css", "resources/js/app.js"],
        }),
    ],
    resolve: {
        alias: {
            vue: "vue/dist/vue.esm-bundler.js",
            "@/": fileURLToPath(new URL("./resources/js", import.meta.url)), // <---- add this
        },
    },
});
