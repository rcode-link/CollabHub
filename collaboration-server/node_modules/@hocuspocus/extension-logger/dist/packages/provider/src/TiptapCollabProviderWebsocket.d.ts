import { CompleteHocuspocusProviderWebsocketConfiguration, HocuspocusProviderWebsocket } from './HocuspocusProviderWebsocket.js';
export type TiptapCollabProviderWebsocketConfiguration = Partial<CompleteHocuspocusProviderWebsocketConfiguration> & AdditionalTiptapCollabProviderWebsocketConfiguration;
export interface AdditionalTiptapCollabProviderWebsocketConfiguration {
    /**
     * A Hocuspocus Cloud App ID, get one here: https://cloud.tiptap.dev
     */
    appId?: string;
    /**
     * If you are using the on-premise version of TiptapCollab, put your baseUrl here (e.g. https://collab.yourdomain.com)
     */
    baseUrl?: string;
    /**
     * Only fill this if you are using Tiptap Collab HA.
     */
    shardKey?: string;
}
export declare class TiptapCollabProviderWebsocket extends HocuspocusProviderWebsocket {
    constructor(configuration: TiptapCollabProviderWebsocketConfiguration);
}
