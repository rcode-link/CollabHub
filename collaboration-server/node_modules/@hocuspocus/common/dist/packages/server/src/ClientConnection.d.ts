/// <reference types="node" />
import { IncomingMessage } from 'http';
import WebSocket from 'ws';
import { Debugger } from './Debugger.js';
import Document from './Document.js';
import { Hocuspocus } from './Hocuspocus.js';
import { onDisconnectPayload } from './types.js';
/**
 * The `ClientConnection` class is responsible for handling an incoming WebSocket
 *
 * TODO-refactor:
 * - use event handlers instead of calling hooks directly, hooks should probably be called from Hocuspocus.ts
 */
export declare class ClientConnection {
    private readonly websocket;
    private readonly request;
    private readonly documentProvider;
    private readonly hooks;
    private readonly debuggerTool;
    private readonly opts;
    private readonly defaultContext;
    private readonly documentConnections;
    private readonly incomingMessageQueue;
    private readonly documentConnectionsEstablished;
    private readonly hookPayloads;
    private readonly callbacks;
    private readonly closeIdleConnectionTimeout;
    private readonly socketId;
    /**
      * The `ClientConnection` class receives incoming WebSocket connections,
      * runs all hooks:
      *
      *  - onConnect for all connections
      *  - onAuthenticate only if required
      *
      * … and if nothings fails it’ll fully establish the connection and
      * load the Document then.
      */
    constructor(websocket: WebSocket, request: IncomingMessage, documentProvider: {
        createDocument: Hocuspocus['createDocument'];
    }, hooks: Hocuspocus['hooks'], debuggerTool: Debugger, opts: {
        requiresAuthentication: boolean;
        timeout: number;
    }, defaultContext?: any);
    /**
     * Set a callback that will be triggered when the connection is closed
     */
    onClose(callback: (document: Document, payload: onDisconnectPayload) => void): ClientConnection;
    /**
     * Create a new connection by the given request and document
     */
    private createConnection;
    private setUpNewConnection;
    private handleQueueingMessage;
    private messageHandler;
}
