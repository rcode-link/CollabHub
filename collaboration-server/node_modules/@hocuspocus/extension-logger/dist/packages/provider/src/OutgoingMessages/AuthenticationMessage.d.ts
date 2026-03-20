import { MessageType, OutgoingMessageArguments } from '../types.js';
import { OutgoingMessage } from '../OutgoingMessage.js';
export declare class AuthenticationMessage extends OutgoingMessage {
    type: MessageType;
    description: string;
    get(args: Partial<OutgoingMessageArguments>): import("lib0/encoding").Encoder;
}
