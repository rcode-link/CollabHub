import Connection from './Connection.js';
import { Debugger } from './Debugger.js';
import Document from './Document.js';
import { IncomingMessage } from './IncomingMessage.js';
export declare class MessageReceiver {
    message: IncomingMessage;
    logger: Debugger;
    defaultTransactionOrigin?: string;
    constructor(message: IncomingMessage, logger: Debugger, defaultTransactionOrigin?: string);
    apply(document: Document, connection?: Connection, reply?: (message: Uint8Array) => void): void;
    readSyncMessage(message: IncomingMessage, document: Document, connection?: Connection, reply?: (message: Uint8Array) => void, requestFirstSync?: boolean): 0 | 1 | 2;
    applyQueryAwarenessMessage(document: Document, reply?: (message: Uint8Array) => void): void;
}
