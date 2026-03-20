import { Encoder } from 'lib0/encoding';
import { MessageType, OutgoingMessageArguments, OutgoingMessageInterface } from './types.js';
export declare class OutgoingMessage implements OutgoingMessageInterface {
    encoder: Encoder;
    type?: MessageType;
    constructor();
    get(args: Partial<OutgoingMessageArguments>): Encoder | undefined;
    toUint8Array(): Uint8Array;
}
