import { Extension, onChangePayload, onLoadDocumentPayload, storePayload, fetchPayload } from '@hocuspocus/server';
export interface DatabaseConfiguration {
    /**
     * Pass a Promise to retrieve updates from your database. The Promise should resolve to
     * an array of items with Y.js-compatible binary data.
     */
    fetch: (data: fetchPayload) => Promise<Uint8Array | null>;
    /**
     * Pass a function to store updates in your database.
     */
    store: (data: storePayload) => Promise<void>;
}
export declare class Database implements Extension {
    /**
     * Default configuration
     */
    configuration: DatabaseConfiguration;
    /**
     * Constructor
     */
    constructor(configuration: Partial<DatabaseConfiguration>);
    /**
     * Get stored data from the database.
     */
    onLoadDocument(data: onLoadDocumentPayload): Promise<any>;
    /**
     * Store new updates in the database.
     */
    onStoreDocument(data: onChangePayload): Promise<void>;
}
