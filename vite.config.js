import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import vuePlugin from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
export default defineConfig({
    build: {
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true
            }
        },
        rollupOptions: {
            output: {
                manualChunks: {
                    'prosemirror': ['prosemirror-state', 'prosemirror-view', 'prosemirror-transform', 'prosemirror-collab'],
                    'tiptap-core': [
                        '@tiptap/core',
                        '@tiptap/starter-kit',
                        '@tiptap/vue-3',
                        '@tiptap/extension-link',
                        '@tiptap/extension-code-block-lowlight',
                        '@tiptap/extension-table',
                        '@tiptap/extension-table-row',
                        '@tiptap/extension-table-header',
                        '@tiptap/extension-table-cell',
                        '@tiptap/extension-mention',
                        '@tiptap/extension-image',
                        '@tiptap/extension-placeholder',
                        '@tiptap/extension-task-item',
                        '@tiptap/extension-task-list',
                        '@tiptap/extension-bold',
                        '@tiptap/extension-heading',
                        '@tiptap/extension-list-item',
                        '@tiptap/extension-strike',
                        '@tiptap/suggestion',
                    ],
                    'tiptap-markdown': ['tiptap-markdown'],
                    'highlight-langs': ['highlight.js', 'lowlight'],
                    'livekit': ['livekit-client'],
                }
            }
        }
    },
    plugins: [
        vuePlugin(),
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
