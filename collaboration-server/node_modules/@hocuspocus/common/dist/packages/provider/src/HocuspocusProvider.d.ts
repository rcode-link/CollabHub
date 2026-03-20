import * as mutex from 'lib0/mutex';
import type { CloseEvent, Event, MessageEvent } from 'ws';
import { Awareness } from 'y-protocols/awareness';
import * as Y from 'yjs';
import EventEmitter from './EventEmitter.js';
import { CompleteHocuspocusProviderWebsocketConfiguration, HocuspocusProviderWebsocket } from './HocuspocusProviderWebsocket.js';
import { ConstructableOutgoingMessage, WebSocketStatus, onAuthenticationFailedParameters, onAwarenessChangeParameters, onAwarenessUpdateParameters, onCloseParameters, onDisconnectParameters, onMessageParameters, onOpenParameters, onOutgoingMessageParameters, onStatelessParameters, onStatusParameters, onSyncedParameters } from './types.js';
export type HocuspocusProviderConfiguration = Required<Pick<CompleteHocuspocusProviderConfiguration, 'name'>> & Partial<CompleteHocuspocusProviderConfiguration> & (Required<Pick<CompleteHocuspocusProviderWebsocketConfiguration, 'url'>> | Required<Pick<CompleteHocuspocusProviderConfiguration, 'websocketProvider'>>);
export interface CompleteHocuspocusProviderConfiguration {
    /**
    * The identifier/name of your document
    */
    name: string;
    /**
     * The actual Y.js document
     */
    document: Y.Doc;
    /**
     * Pass false to disable broadcasting between browser tabs.
     */
    broadcast: boolean;
    /**
     * An Awareness instance to keep the presence state of all clients.
     *
     * You can disable sharing awareness information by passing `null`.
     * Note that having no awareness information shared across all connections will break our ping checks
     * and thus trigger reconnects. You should always have at least one Provider with enabled awareness per
     * socket connection, or ensure that the Provider receives messages before running into `HocuspocusProviderWebsocket.messageReconnectTimeout`.
     */
    awareness: Awareness | null;
    /**
     * A token that’s sent to the backend for authentication purposes.
     */
    token: string | (() => string) | (() => Promise<string>) | null;
    /**
     * URL parameters that should be added.
     */
    parameters: {
        [key: string]: any;
    };
    /**
     * Hocuspocus websocket provider
     */
    websocketProvider: HocuspocusProviderWebsocket;
    /**
     * Force syncing the document in the defined interval.
     */
    forceSyncInterval: false | number;
    onAuthenticated: () => void;
    onAuthenticationFailed: (data: onAuthenticationFailedParameters) => void;
    onOpen: (data: onOpenParameters) => void;
    onConnect: () => void;
    onMessage: (data: onMessageParameters) => void;
    onOutgoingMessage: (data: onOutgoingMessageParameters) => void;
    onStatus: (data: onStatusParameters) => void;
    onSynced: (data: onSyncedParameters) => void;
    onDisconnect: (data: onDisconnectParameters) => void;
    onClose: (data: onCloseParameters) => void;
    onDestroy: () => void;
    onAwarenessUpdate: (data: onAwarenessUpdateParameters) => void;
    onAwarenessChange: (data: onAwarenessChangeParameters) => void;
    onStateless: (data: onStatelessParameters) => void;
    /**
     * Don’t output any warnings.
     */
    quiet: boolean;
    /**
     * Pass `false` to start the connection manually.
     */
    connect: boolean;
    /**
     * Pass `false` to close the connection manually.
     */
    preserveConnection: boolean;
}
export declare class AwarenessError extends Error {
    code: number;
}
export declare class HocuspocusProvider extends EventEmitter {
    configuration: CompleteHocuspocusProviderConfiguration;
    subscribedToBroadcastChannel: boolean;
    isSynced: boolean;
    unsyncedChanges: number;
    status: WebSocketStatus;
    isAuthenticated: boolean;
    authorizedScope: string | undefined;
    mux: mutex.mutex;
    intervals: any;
    isConnected: boolean;
    constructor(configuration: HocuspocusProviderConfiguration);
    boundDocumentUpdateHandler: (update: Uint8Array, origin: any) => void;
    boundAwarenessUpdateHandler: ({ added, updated, removed }: any, origin: any) => void;
    boundBroadcastChannelSubscriber: (data: ArrayBuffer) => void;
    boundPageHide: () => void;
    boundOnOpen: (event: Event) => Promise<void>;
    boundOnClose: (event: CloseEvent) => void;
    boundOnStatus: ({ status }: onStatusParameters) => void;
    forwardConnect: (e: any) => this;
    forwardOpen: (e: any) => this;
    forwardClose: (e: any) => this;
    forwardDisconnect: (e: any) => this;
    forwardDestroy: (e: any) => this;
    onStatus({ status }: onStatusParameters): void;
    setConfiguration(configuration?: Partial<HocuspocusProviderConfiguration>): void;
    get document(): Y.Doc;
    get awareness(): Awareness | null;
    get hasUnsyncedChanges(): boolean;
    private resetUnsyncedChanges;
    incrementUnsyncedChanges(): void;
    decrementUnsyncedChanges(): void;
    forceSync(): void;
    pageHide(): void;
    registerEventListeners(): void;
    sendStateless(payload: string): void;
    documentUpdateHandler(update: Uint8Array, origin: any): void;
    awarenessUpdateHandler({ added, updated, removed }: any, origin: any): void;
    /**
     * Indicates whether a first handshake with the server has been established
     *
     * Note: this does not mean all updates from the client have been persisted to the backend. For this,
     * use `hasUnsyncedChanges`.
     */
    get synced(): boolean;
    set synced(state: boolean);
    receiveStateless(payload: string): void;
    get isAuthenticationRequired(): boolean;
    connect(): Promise<any>;
    disconnect(): void;
    onOpen(event: Event): Promise<void>;
    getToken(): Promise<string | null>;
    startSync(): void;
    send(message: ConstructableOutgoingMessage, args: any, broadcast?: boolean): void;
    onMessage(event: MessageEvent): void;
    onClose(event: CloseEvent): void;
    destroy(): void;
    permissionDeniedHandler(reason: string): void;
    authenticatedHandler(scope: string): void;
    get broadcastChannel(): string;
    broadcastChannelSubscriber(data: ArrayBuffer): void;
    subscribeToBroadcastChannel(): void;
    disconnectBroadcastChannel(): void;
    broadcast(Message: ConstructableOutgoingMessage, args?: any): void;
    setAwarenessField(key: string, value: any): void;
}
