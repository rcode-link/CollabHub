import './bootstrap';
import { createApp } from "vue";
import router from "./router/router.js";
import { createPinia } from "pinia";
import App from "./components/App.vue";
import 'tippy.js/dist/tippy.css';
import VueTippy from "vue-tippy";
import { abilitiesPlugin } from '@casl/vue';
import ability from "./functions/ability";
import 'vue3-toastify/dist/index.css';

const app = createApp(App);
const pinia = createPinia()
app.use(abilitiesPlugin, ability)
app.use(pinia)
app.use(router);
app.use(VueTippy, {
    defaultProps: { placement: 'right' },
})

app.mount('#app')
