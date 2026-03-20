/// <reference types="node" />
import { Extension, onChangePayload, onConnectPayload, onLoadDocumentPayload, onDisconnectPayload } from '@hocuspocus/server';
import { Doc } from 'yjs';
import { Transformer } from '@hocuspocus/transformer';
export declare enum Events {
    onChange = "change",
    onConnect = "connect",
    onCreate = "create",
    onDisconnect = "disconnect"
}
export interface Configuration {
    debounce: number | false | null;
    debounceMaxWait: number;
    secret: string;
    transformer: Transformer | {
        toYdoc: (document: any) => Doc;
        fromYdoc: (document: Doc) => any;
    };
    url: string;
    events: Array<Events>;
}
export declare class Webhook implements Extension {
    configuration: Configuration;
    debounced: Map<string, {
        timeout: NodeJS.Timeout;
        start: number;
    }>;
    /**
     * Constructor
     */
    constructor(configuration?: Partial<Configuration>);
    /**
     * Create a signature for the response body
     */
    createSignature(body: string): string;
    /**
     * debounce the given function, using the given identifier
     */
    debounce(id: string, func: Function): void;
    /**
     * Send a request to the given url containing the given data
     */
    sendRequest(event: Events, payload: any): Promise<import("axios").AxiosResponse<any, any>>;
    /**
     * onChange hook
     */
    onChange(data: onChangePayload): Promise<void>;
    /**
     * onLoadDocument hook
     */
    onLoadDocument(data: onLoadDocumentPayload): Promise<void>;
    /**
     * onConnect hook
     */
    onConnect(data: onConnectPayload): Promise<any>;
    onDisconnect(data: onDisconnectPayload): Promise<void>;
}
