export default class EventEmitter {
    callbacks: {
        [key: string]: Function[];
    };
    on(event: string, fn: Function): this;
    protected emit(event: string, ...args: any): this;
    off(event: string, fn?: Function): this;
    removeAllListeners(): void;
}
