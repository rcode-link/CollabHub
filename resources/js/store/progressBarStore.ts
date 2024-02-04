import {defineStore} from "pinia";

export const useProgressBarStore = defineStore('ProgressBarStore', {
    state: () => ({present: 0, interval: null, time: 3000}),

    actions: {
        start() {
            const cut = 10000 / Math.floor(3000)
            clearInterval(this.interval);
            this.present = 0;
            this.interval = setInterval(() => {
                this.present += Math.floor(Math.floor(cut * Math.random()))
                if (this.present > 98) {
                    this.finish();
                }
            }, 100)
        },
        finish() {
            clearInterval(this.interval);
            this.present = 100;
            setTimeout(() => {
                this.present = 0
            }, 500);
        }
    },
})
