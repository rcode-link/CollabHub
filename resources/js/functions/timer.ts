import {ref} from "vue";

export function useTimer(){
    const timerId = ref(null);
    const start = ref(null);
    const remaining = ref(null);
    const callback = ref(() => {});

    const setTimer = (cb, delay) => {
        window.clearTimeout(timerId.value);
        timerId.value = null;
        remaining.value = delay;
        callback.value = cb;
        resume();
    }

    const pause = function() {
        window.clearTimeout(timerId.value);
        timerId.value = null;
        remaining.value -= Date.now() - start.value;
    };

    const resume = function() {
        if (timerId.value) {
            return;
        }

        start.value = Date.now();
        timerId.value = setTimeout(() => {
            window.clearTimeout(timerId.value);
            timerId.value = null;
            remaining.value = null;
            start.value = null;
            callback.value()
        }, remaining.value);
    };

    const clear = () => {
        window.clearTimeout(timerId.value);
        timerId.value = null;
        remaining.value = null;
        start.value = null;
    }


    return {
        setTimer,
        pause,
        resume,
        clear
    }

}
