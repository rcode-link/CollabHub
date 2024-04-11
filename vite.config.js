import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import vuePlugin from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
    plugins: [
        vuePlugin(),
        VitePWA({
            srcDir: "public/build/",
            outDir: "public/build",
            registerType: "autoUpdate",
            workbox: {
                globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
            },
            includeAssets: ["**/*"],
            manifest: {
                name: "My Awesome App",
                short_name: "MyApp",
                description: "My Awesome App description",
                theme_color: "#ffffff",
                icons: [
                    {
                        src: "pwa-192x192.png",
                        sizes: "192x192",
                        type: "image/png",
                    },
                    {
                        src: "pwa-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                    },
                ],
            },
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
