import * as encoding from 'lib0/encoding';
import { MessageType, OutgoingMessageArguments } from '../types.js';
import { OutgoingMessage } from '../OutgoingMessage.js';
export declare class QueryAwarenessMessage extends OutgoingMessage {
    type: MessageType;
    description: string;
    get(args: Partial<OutgoingMessageArguments>): encoding.Encoder;
}
