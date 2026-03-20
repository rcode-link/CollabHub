export interface CloseEvent {
    code: number;
    reason: string;
}
/**
 * The server is terminating the connection because a data frame was received
 * that is too large.
 * See: https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent/code
 */
export declare const MessageTooBig: CloseEvent;
/**
 * The server successfully processed the request, asks that the requester reset
 * its document view, and is not returning any content.
 */
export declare const ResetConnection: CloseEvent;
/**
 * Similar to Forbidden, but specifically for use when authentication is required and has
 * failed or has not yet been provided.
 */
export declare const Unauthorized: CloseEvent;
/**
 * The request contained valid data and was understood by the server, but the server
 * is refusing action.
 */
export declare const Forbidden: CloseEvent;
/**
 * The server timed out waiting for the request.
 */
export declare const ConnectionTimeout: CloseEvent;
