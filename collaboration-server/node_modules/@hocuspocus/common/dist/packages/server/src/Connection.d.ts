/// <reference types="node" />
/// <reference types="node" />
import { IncomingMessage as HTTPIncomingMessage } from 'http';
import AsyncLock from 'async-lock';
import WebSocket from 'ws';
import { CloseEvent } from '@hocuspocus/common';
import Document from './Document.js';
import { Debugger } from './Debugger.js';
import { onStatelessPayload } from './types.js';
export declare class Connection {
    webSocket: WebSocket;
    context: any;
    document: Document;
    pingInterval: NodeJS.Timeout;
    pongReceived: boolean;
    request: HTTPIncomingMessage;
    timeout: number;
    callbacks: any;
    socketId: string;
    lock: AsyncLock;
    readOnly: Boolean;
    logger: Debugger;
    /**
     * Constructor.
     */
    constructor(connection: WebSocket, request: HTTPIncomingMessage, document: Document, timeout: number, socketId: string, context: any, readOnly: boolean | undefined, logger: Debugger);
    boundClose: (event?: CloseEvent) => void;
    boundHandlePong: () => void;
    handlePong(): void;
    /**
     * Set a callback that will be triggered when the connection is closed
     */
    onClose(callback: (document: Document, event?: CloseEvent) => void): Connection;
    /**
     * Set a callback that will be triggered when an stateless message is received
     */
    onStatelessCallback(callback: (payload: onStatelessPayload) => Promise<void>): Connection;
    /**
     * Set a callback that will be triggered before an message is handled
     */
    beforeHandleMessage(callback: (connection: Connection, update: Uint8Array) => Promise<any>): Connection;
    /**
     * Send the given message
     */
    send(message: any): void;
    /**
     * Send a stateless message with payload
     */
    sendStateless(payload: string): void;
    /**
     * Graceful wrapper around the WebSocket close method.
     */
    close(event?: CloseEvent): void;
    /**
     * Check if pong was received and close the connection otherwise
     * @private
     */
    private check;
    /**
     * Send the current document awareness to the client, if any
     * @private
     */
    private sendCurrentAwareness;
    /**
     * Handle an incoming message
     * @public
     */
    handleMessage(data: Uint8Array): void;
}
export default Connection;
