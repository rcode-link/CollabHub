import { Decoder } from 'lib0/decoding';
import { Encoder } from 'lib0/encoding';
import { MessageType } from './types.js';
export declare class IncomingMessage {
    /**
     * Access to the received message.
     */
    decoder: Decoder;
    /**
     * Private encoder; can be undefined.
     *
     * Lazy creation of the encoder speeds up IncomingMessages that need only a decoder.
     */
    private encoderInternal?;
    constructor(input: any);
    get encoder(): Encoder;
    readVarUint8Array(): Uint8Array;
    readVarUint(): number;
    readVarString(): string;
    toUint8Array(): Uint8Array;
    writeVarUint(type: MessageType): void;
    writeVarString(string: string): void;
    get length(): number;
}
