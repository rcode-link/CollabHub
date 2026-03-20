export declare const useDebounce: () => {
    debounce: (id: string, func: Function, debounce: number, maxDebounce: number) => any;
    isDebounced: (id: string) => boolean;
    executeNow: (id: string) => any;
};
