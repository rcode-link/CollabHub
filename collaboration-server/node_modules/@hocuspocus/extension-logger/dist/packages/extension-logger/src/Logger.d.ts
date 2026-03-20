import { Extension, onChangePayload, onConfigurePayload, onConnectPayload, onLoadDocumentPayload, onDestroyPayload, onDisconnectPayload, onRequestPayload, onUpgradePayload } from '@hocuspocus/server';
export interface LoggerConfiguration {
    /**
     * Prepend all logging message with a string.
     *
     * @deprecated
     */
    prefix: null | string;
    /**
     * Whether to log something for the `onLoadDocument` hook.
     */
    onLoadDocument: boolean;
    /**
     * Whether to log something for the `onChange` hook.
     */
    onChange: boolean;
    /**
     * Whether to log something for the `onStoreDocument` hook.
     */
    onStoreDocument: boolean;
    /**
     * Whether to log something for the `onConnect` hook.
     */
    onConnect: boolean;
    /**
     * Whether to log something for the `onDisconnect` hook.
     */
    onDisconnect: boolean;
    /**
     * Whether to log something for the `onUpgrade` hook.
     */
    onUpgrade: boolean;
    /**
     * Whether to log something for the `onRequest` hook.
     */
    onRequest: boolean;
    /**
     * Whether to log something for the `onDestroy` hook.
     */
    onDestroy: boolean;
    /**
     * Whether to log something for the `onConfigure` hook.
     */
    onConfigure: boolean;
    /**
     * A log function, if none is provided output will go to console
     */
    log: (...args: any[]) => void;
}
export declare class Logger implements Extension {
    name: string | null;
    configuration: LoggerConfiguration;
    /**
     * Constructor
     */
    constructor(configuration?: Partial<LoggerConfiguration>);
    onConfigure(data: onConfigurePayload): Promise<void>;
    onLoadDocument(data: onLoadDocumentPayload): Promise<void>;
    onChange(data: onChangePayload): Promise<void>;
    onStoreDocument(data: onDisconnectPayload): Promise<void>;
    onConnect(data: onConnectPayload): Promise<void>;
    onDisconnect(data: onDisconnectPayload): Promise<void>;
    onUpgrade(data: onUpgradePayload): Promise<void>;
    onRequest(data: onRequestPayload): Promise<void>;
    onDestroy(data: onDestroyPayload): Promise<void>;
    private log;
}
