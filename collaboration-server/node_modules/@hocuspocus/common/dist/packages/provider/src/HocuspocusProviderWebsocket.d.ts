import type { MessageEvent } from 'ws';
import { Event } from 'ws';
import EventEmitter from './EventEmitter.js';
import { HocuspocusProvider } from './HocuspocusProvider.js';
import { WebSocketStatus, onAwarenessChangeParameters, onAwarenessUpdateParameters, onCloseParameters, onDisconnectParameters, onMessageParameters, onOpenParameters, onOutgoingMessageParameters, onStatusParameters } from './types.js';
export type HocusPocusWebSocket = WebSocket & {
    identifier: string;
};
export type HocuspocusProviderWebsocketConfiguration = Required<Pick<CompleteHocuspocusProviderWebsocketConfiguration, 'url'>> & Partial<CompleteHocuspocusProviderWebsocketConfiguration>;
export interface CompleteHocuspocusProviderWebsocketConfiguration {
    /**
     * URL of your @hocuspocus/server instance
     */
    url: string;
    /**
     * Pass `false` to start the connection manually.
     */
    connect: boolean;
    /**
     * URL parameters that should be added.
     */
    parameters: {
        [key: string]: any;
    };
    /**
     * An optional WebSocket polyfill, for example for Node.js
     */
    WebSocketPolyfill: any;
    /**
     * Disconnect when no message is received for the defined amount of milliseconds.
     */
    messageReconnectTimeout: number;
    /**
     * The delay between each attempt in milliseconds. You can provide a factor to have the delay grow exponentially.
     */
    delay: number;
    /**
     * The initialDelay is the amount of time to wait before making the first attempt. This option should typically be 0 since you typically want the first attempt to happen immediately.
     */
    initialDelay: number;
    /**
     * The factor option is used to grow the delay exponentially.
     */
    factor: number;
    /**
     * The maximum number of attempts or 0 if there is no limit on number of attempts.
     */
    maxAttempts: number;
    /**
     * minDelay is used to set a lower bound of delay when jitter is enabled. This property has no effect if jitter is disabled.
     */
    minDelay: number;
    /**
     * The maxDelay option is used to set an upper bound for the delay when factor is enabled. A value of 0 can be provided if there should be no upper bound when calculating delay.
     */
    maxDelay: number;
    /**
     * If jitter is true then the calculated delay will be a random integer value between minDelay and the calculated delay for the current iteration.
     */
    jitter: boolean;
    /**
     * A timeout in milliseconds. If timeout is non-zero then a timer is set using setTimeout. If the timeout is triggered then future attempts will be aborted.
     */
    timeout: number;
    onOpen: (data: onOpenParameters) => void;
    onConnect: () => void;
    onMessage: (data: onMessageParameters) => void;
    onOutgoingMessage: (data: onOutgoingMessageParameters) => void;
    onStatus: (data: onStatusParameters) => void;
    onDisconnect: (data: onDisconnectParameters) => void;
    onClose: (data: onCloseParameters) => void;
    onDestroy: () => void;
    onAwarenessUpdate: (data: onAwarenessUpdateParameters) => void;
    onAwarenessChange: (data: onAwarenessChangeParameters) => void;
    /**
     * Don’t output any warnings.
     */
    quiet: boolean;
    /**
     * Map of attached providers keyed by documentName.
     */
    providerMap: Map<string, HocuspocusProvider>;
}
export declare class HocuspocusProviderWebsocket extends EventEmitter {
    private messageQueue;
    configuration: CompleteHocuspocusProviderWebsocketConfiguration;
    webSocket: HocusPocusWebSocket | null;
    webSocketHandlers: {
        [key: string]: any;
    };
    shouldConnect: boolean;
    status: WebSocketStatus;
    lastMessageReceived: number;
    identifier: number;
    intervals: any;
    connectionAttempt: {
        resolve: (value?: any) => void;
        reject: (reason?: any) => void;
    } | null;
    constructor(configuration: HocuspocusProviderWebsocketConfiguration);
    receivedOnOpenPayload?: Event | undefined;
    receivedOnStatusPayload?: onStatusParameters | undefined;
    onOpen(event: Event): Promise<void>;
    onStatus(data: onStatusParameters): Promise<void>;
    attach(provider: HocuspocusProvider): Promise<any> | undefined;
    detach(provider: HocuspocusProvider): void;
    setConfiguration(configuration?: Partial<HocuspocusProviderWebsocketConfiguration>): void;
    cancelWebsocketRetry?: () => void;
    connect(): Promise<unknown>;
    attachWebSocketListeners(ws: HocusPocusWebSocket, reject: Function): void;
    cleanupWebSocket(): void;
    createWebSocketConnection(): Promise<unknown>;
    onMessage(event: MessageEvent): void;
    resolveConnectionAttempt(): void;
    stopConnectionAttempt(): void;
    rejectConnectionAttempt(): void;
    closeTries: number;
    checkConnection(): void;
    get serverUrl(): string;
    get url(): string;
    disconnect(): void;
    send(message: any): void;
    onClose({ event }: onCloseParameters): void;
    destroy(): void;
}
