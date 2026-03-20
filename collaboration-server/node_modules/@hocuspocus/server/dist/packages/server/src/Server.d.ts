/// <reference types="node" />
import { IncomingMessage, Server as HTTPServer, ServerResponse } from 'http';
import { ServerOptions, WebSocketServer } from 'ws';
import { Hocuspocus } from './Hocuspocus.js';
export declare class Server {
    httpServer: HTTPServer;
    webSocketServer: WebSocketServer;
    hocuspocus: Hocuspocus;
    constructor(hocuspocus: Hocuspocus, websocketOptions?: ServerOptions);
    setupWebsocketConnection: () => void;
    setupHttpUpgrade: () => void;
    requestHandler: (request: IncomingMessage, response: ServerResponse) => Promise<void>;
}
