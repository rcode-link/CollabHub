import { HocuspocusProviderWebsocket, HocuspocusProviderWebsocketConfiguration } from '@hocuspocus/provider';
import { Hocuspocus } from '@hocuspocus/server';
export declare const newHocuspocusProviderWebsocket: (server: Hocuspocus, options?: Partial<Omit<HocuspocusProviderWebsocketConfiguration, 'url'>>) => HocuspocusProviderWebsocket;
