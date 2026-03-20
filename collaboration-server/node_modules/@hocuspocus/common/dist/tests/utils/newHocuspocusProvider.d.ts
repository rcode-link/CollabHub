import { HocuspocusProvider, HocuspocusProviderConfiguration, HocuspocusProviderWebsocket, HocuspocusProviderWebsocketConfiguration } from '@hocuspocus/provider';
import { Hocuspocus } from '@hocuspocus/server';
export declare const newHocuspocusProvider: (server: Hocuspocus, options?: Partial<HocuspocusProviderConfiguration>, websocketOptions?: Partial<HocuspocusProviderWebsocketConfiguration>, websocketProvider?: HocuspocusProviderWebsocket) => HocuspocusProvider;
