import {defineConfig} from 'vite';
import laravel from 'laravel-vite-plugin';
import vuePlugin from "@vitejs/plugin-vue";
import {resolve} from "path";

export default defineConfig({
    plugins: [
        vuePlugin(),
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/app.js',
            ],
            refresh: true,
        }),

    ],
    resolve: {
        alias: {
            vue: 'vue/dist/vue.esm-bundler.js',
            '@': '/resources/js',
            'ziggy-js': resolve('vendor/tightenco/ziggy'),
        }
    },
});
