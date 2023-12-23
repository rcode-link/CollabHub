import Echo from 'laravel-echo';
import {Axios} from 'axios';

declare global {
    interface Window {
        Echo: Echo;
        axios: Axios,
        env: {
            VITE_APP_NAME: string
            VITE_PUSHER_APP_KEY: string
            VITE_PUSHER_HOST: string
            VITE_PUSHER_PORT: string
            VITE_PUSHER_SCHEME: string
            VITE_PUSHER_APP_CLUSTER: string
            VITE_LIVEKIT_URL: string
        }
    }
}
