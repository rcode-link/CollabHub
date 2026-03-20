import { HocuspocusProvider } from './HocuspocusProvider.js';
import { IncomingMessage } from './IncomingMessage.js';
export declare class MessageReceiver {
    message: IncomingMessage;
    broadcasted: boolean;
    constructor(message: IncomingMessage);
    setBroadcasted(value: boolean): this;
    apply(provider: HocuspocusProvider, emitSynced: boolean): void;
    private applySyncMessage;
    applySyncStatusMessage(provider: HocuspocusProvider, applied: boolean): void;
    private applyAwarenessMessage;
    private applyAuthMessage;
    private applyQueryAwarenessMessage;
}
