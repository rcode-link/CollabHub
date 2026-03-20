import Document from './Document.js';
import type { Hocuspocus } from './Hocuspocus.js';
import type { DirectConnection as DirectConnectionInterface } from './types.js';
export declare class DirectConnection implements DirectConnectionInterface {
    document: Document | null;
    instance: Hocuspocus;
    context: any;
    /**
     * Constructor.
     */
    constructor(document: Document, instance: Hocuspocus, context?: any);
    transact(transaction: (document: Document) => void, transactionOrigin?: any): Promise<void>;
    disconnect(): Promise<void>;
}
