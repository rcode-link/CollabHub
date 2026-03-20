import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';
export declare const writeAuthentication: (encoder: encoding.Encoder, auth: string) => void;
export declare const writePermissionDenied: (encoder: encoding.Encoder, reason: string) => void;
export declare const writeAuthenticated: (encoder: encoding.Encoder, scope: 'readonly' | 'read-write') => void;
export declare const readAuthMessage: (decoder: decoding.Decoder, permissionDeniedHandler: (reason: string) => void, authenticatedHandler: (scope: string) => void) => void;
