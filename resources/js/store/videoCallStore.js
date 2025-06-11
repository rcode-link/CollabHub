import { defineStore } from "pinia";

export const useVideoCallStore = defineStore("videoCall", {
    state: () => ({
        videoId: '',
        size: 'fullScreen'
    }),
    actions: {
        setToken(val) { this.videoId = val;},
        setSize(val) {
            console.log({val});
            this.size = val ? 'fullScreen' : ''
        }
    }

});

