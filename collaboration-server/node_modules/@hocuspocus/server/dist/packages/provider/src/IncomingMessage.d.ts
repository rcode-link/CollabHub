import { Decoder } from 'lib0/decoding';
import { Encoder } from 'lib0/encoding';
import { MessageType } from './types.js';
export declare class IncomingMessage {
    data: any;
    encoder: Encoder;
    decoder: Decoder;
    constructor(data: any);
    peekVarString(): string;
    readVarUint(): MessageType;
    readVarString(): string;
    readVarUint8Array(): Uint8Array;
    writeVarUint(type: MessageType): void;
    writeVarString(string: string): void;
    writeVarUint8Array(data: Uint8Array): void;
    length(): number;
}
