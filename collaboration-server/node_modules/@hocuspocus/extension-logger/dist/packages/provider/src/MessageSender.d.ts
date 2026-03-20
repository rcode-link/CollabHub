import { Encoder } from 'lib0/encoding';
import { ConstructableOutgoingMessage } from './types.js';
export declare class MessageSender {
    encoder: Encoder;
    message: any;
    constructor(Message: ConstructableOutgoingMessage, args?: any);
    create(): Uint8Array;
    send(webSocket: any): void;
    broadcast(channel: string): void;
}
