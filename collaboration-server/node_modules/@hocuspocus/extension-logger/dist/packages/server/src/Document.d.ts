import WebSocket from 'ws';
import { Awareness } from 'y-protocols/awareness';
import { Doc } from 'yjs';
import { mutex } from 'lib0/mutex.js';
import Connection from './Connection.js';
import { Debugger } from './Debugger.js';
export declare class Document extends Doc {
    awareness: Awareness;
    callbacks: {
        onUpdate: (document: Document, connection: Connection, update: Uint8Array) => void;
        beforeBroadcastStateless: (document: Document, stateless: string) => void;
    };
    connections: Map<WebSocket, {
        clients: Set<any>;
        connection: Connection;
    }>;
    directConnectionsCount: number;
    name: string;
    mux: mutex;
    logger?: Debugger;
    isLoading: boolean;
    isDestroyed: boolean;
    /**
     * Constructor.
     */
    constructor(name: string, logger?: Debugger, yDocOptions?: {});
    /**
     * Check if the Document (XMLFragment or Map) is empty
     */
    isEmpty(fieldName: string): boolean;
    /**
     * Merge the given document(s) into this one
     */
    merge(documents: Doc | Array<Doc>): Document;
    /**
     * Set a callback that will be triggered when the document is updated
     */
    onUpdate(callback: (document: Document, connection: Connection, update: Uint8Array) => void): Document;
    /**
     * Set a callback that will be triggered before a stateless message is broadcasted
     */
    beforeBroadcastStateless(callback: (document: Document, stateless: string) => void): Document;
    /**
     * Register a connection and a set of clients on this document keyed by the
     * underlying websocket connection
     */
    addConnection(connection: Connection): Document;
    /**
     * Is the given connection registered on this document
     */
    hasConnection(connection: Connection): boolean;
    /**
     * Remove the given connection from this document
     */
    removeConnection(connection: Connection): Document;
    addDirectConnection(): Document;
    removeDirectConnection(): Document;
    /**
     * Get the number of active connections for this document
     */
    getConnectionsCount(): number;
    /**
     * Get an array of registered connections
     */
    getConnections(): Array<Connection>;
    /**
     * Get the client ids for the given connection instance
     */
    getClients(connectionInstance: WebSocket): Set<any>;
    /**
     * Has the document awareness states
     */
    hasAwarenessStates(): boolean;
    /**
     * Apply the given awareness update
     */
    applyAwarenessUpdate(connection: Connection, update: Uint8Array): Document;
    /**
     * Handle an awareness update and sync changes to clients
     * @private
     */
    private handleAwarenessUpdate;
    /**
     * Handle an updated document and sync changes to clients
     */
    private handleUpdate;
    /**
     * Broadcast stateless message to all connections
     */
    broadcastStateless(payload: string, filter?: (conn: Connection) => boolean): void;
    destroy(): void;
}
export default Document;
