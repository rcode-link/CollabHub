import "./bootstrap";
import { createApp } from "vue";
import router from "./router/router.js";
import { createPinia } from "pinia";
import App from "./components/App.vue";
import "tippy.js/dist/tippy.css";
import VueTippy from "vue-tippy";
import { abilitiesPlugin } from "@casl/vue";
import ability from "./functions/ability";
import "vue3-toastify/dist/index.css";
import * as Sentry from "@sentry/vue";
import "../../src/registerServiceWorker.js";
const app = createApp(App);
const pinia = createPinia();
app.use(abilitiesPlugin, ability);
app.use(pinia);
app.use(router);
Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN_PUBLIC,
    integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
            maskAllText: true,
            blockAllMedia: true,
        }),
    ],
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT,
    // Performance Monitoring
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
    // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
    tracePropagationTargets: [window.location.host],
    // Session Replay
    replaysSessionSampleRate: 1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

app.use(VueTippy, {
    defaultProps: { placement: "right" },
});

app.mount("#app");
