import { MessageType, OutgoingMessageArguments } from '../types.js';
import { OutgoingMessage } from '../OutgoingMessage.js';
export declare class StatelessMessage extends OutgoingMessage {
    type: MessageType;
    description: string;
    get(args: Partial<OutgoingMessageArguments>): import("lib0/encoding").Encoder;
}
