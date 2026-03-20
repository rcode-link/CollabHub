export declare class Debugger {
    logs: any[];
    listen: boolean;
    output: boolean;
    enable(): void;
    disable(): void;
    verbose(): void;
    quiet(): void;
    log(message: any): this;
    flush(): this;
    get(): {
        logs: any[];
    };
}
