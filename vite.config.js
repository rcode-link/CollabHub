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
            workbox: {
                globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
            },
            includeAssets: ["**/*"],
            manifest: {
                start_url: "/",
                name: "CollabHub",
                short_name: "CH",
                description: "CollabHub Instance",
                theme_color: "#ffffff",
                icons: [
                    {
                        src: "../logo.png",
                        sizes: "192x192",
                        type: "image/x-icon",
                        purpose: "any",
                    },
                    {
                        src: "../logo.png",
                        sizes: "512x512",
                        type: "image/png",
                    },
                ],
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
