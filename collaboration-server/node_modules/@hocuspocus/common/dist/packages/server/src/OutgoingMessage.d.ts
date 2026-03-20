import { Encoder } from 'lib0/encoding';
import { Awareness } from 'y-protocols/awareness';
import Document from './Document.js';
export declare class OutgoingMessage {
    encoder: Encoder;
    type?: number;
    category?: string;
    constructor(documentName: string);
    createSyncMessage(): OutgoingMessage;
    createSyncReplyMessage(): OutgoingMessage;
    createAwarenessUpdateMessage(awareness: Awareness, changedClients?: Array<any>): OutgoingMessage;
    writeQueryAwareness(): OutgoingMessage;
    writeAuthenticated(readonly: boolean): OutgoingMessage;
    writePermissionDenied(reason: string): OutgoingMessage;
    writeFirstSyncStepFor(document: Document): OutgoingMessage;
    writeUpdate(update: Uint8Array): OutgoingMessage;
    writeStateless(payload: string): OutgoingMessage;
    writeBroadcastStateless(payload: string): OutgoingMessage;
    writeSyncStatus(updateSaved: boolean): OutgoingMessage;
    toUint8Array(): Uint8Array;
}
