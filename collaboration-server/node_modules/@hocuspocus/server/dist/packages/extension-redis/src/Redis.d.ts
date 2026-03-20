/// <reference types="node" />
import RedisClient, { ClusterNode, ClusterOptions, RedisOptions } from 'ioredis';
import Redlock from 'redlock';
import { Extension, afterLoadDocumentPayload, afterStoreDocumentPayload, onDisconnectPayload, onStoreDocumentPayload, onAwarenessUpdatePayload, onChangePayload, Debugger, onConfigurePayload, beforeBroadcastStatelessPayload, Hocuspocus } from '@hocuspocus/server';
export type RedisInstance = RedisClient.Cluster | RedisClient.Redis;
export interface Configuration {
    /**
     * Redis port
     */
    port: number;
    /**
     * Redis host
     */
    host: string;
    /**
     * Redis Cluster
     */
    nodes?: ClusterNode[];
    /**
     * Duplicate from an existed Redis instance
     */
    redis?: RedisInstance;
    /**
     * Redis instance creator
     */
    createClient?: () => RedisInstance;
    /**
     * Options passed directly to Redis constructor
     *
     * https://github.com/luin/ioredis/blob/master/API.md#new-redisport-host-options
     */
    options?: ClusterOptions | RedisOptions;
    /**
     * An unique instance name, required to filter messages in Redis.
     * If none is provided an unique id is generated.
     */
    identifier: string;
    /**
     * Namespace for Redis keys, if none is provided 'hocuspocus' is used
     */
    prefix: string;
    /**
     * The maximum time for the Redis lock in ms (in case it can’t be released).
     */
    lockTimeout: number;
    /**
     * A delay before onDisconnect is executed. This allows last minute updates'
     * sync messages to be received by the subscription before it's closed.
     */
    disconnectDelay: number;
}
export declare class Redis implements Extension {
    /**
     * Make sure to give that extension a higher priority, so
     * the `onStoreDocument` hook is able to intercept the chain,
     * before documents are stored to the database.
     */
    priority: number;
    configuration: Configuration;
    redisTransactionOrigin: string;
    pub: RedisInstance;
    sub: RedisInstance;
    instance: Hocuspocus;
    redlock: Redlock;
    locks: Map<string, Redlock.Lock>;
    logger: Debugger;
    messagePrefix: Buffer;
    /**
     * When we have a high frequency of updates to a document we don't need tons of setTimeouts
     * piling up, so we'll track them to keep it to the most recent per document.
     */
    private pendingDisconnects;
    private pendingAfterStoreDocumentResolves;
    constructor(configuration: Partial<Configuration>);
    onConfigure({ instance }: onConfigurePayload): Promise<void>;
    private getKey;
    private pubKey;
    private subKey;
    private lockKey;
    private encodeMessage;
    private decodeMessage;
    /**
     * Once a document is loaded, subscribe to the channel in Redis.
     */
    afterLoadDocument({ documentName, document }: afterLoadDocumentPayload): Promise<unknown>;
    /**
     * Publish the first sync step through Redis.
     */
    private publishFirstSyncStep;
    /**
     * Let’s ask Redis who is connected already.
     */
    private requestAwarenessFromOtherInstances;
    /**
     * Before the document is stored, make sure to set a lock in Redis.
     * That’s meant to avoid conflicts with other instances trying to store the document.
     */
    onStoreDocument({ documentName }: onStoreDocumentPayload): Promise<unknown>;
    /**
     * Release the Redis lock, so other instances can store documents.
     */
    afterStoreDocument({ documentName, socketId }: afterStoreDocumentPayload): Promise<void>;
    /**
     * Handle awareness update messages received directly by this Hocuspocus instance.
     */
    onAwarenessUpdate({ documentName, awareness, added, updated, removed, }: onAwarenessUpdatePayload): Promise<number>;
    /**
     * Handle incoming messages published on subscribed document channels.
     * Note that this will also include messages from ourselves as it is not possible
     * in Redis to filter these.
    */
    private handleIncomingMessage;
    /**
     * if the ydoc changed, we'll need to inform other Hocuspocus servers about it.
     */
    onChange(data: onChangePayload): Promise<any>;
    /**
     * Make sure to *not* listen for further changes, when there’s
     * no one connected anymore.
     */
    onDisconnect: ({ documentName }: onDisconnectPayload) => Promise<void>;
    beforeBroadcastStateless(data: beforeBroadcastStatelessPayload): Promise<number>;
    /**
     * Kill the Redlock connection immediately.
     */
    onDestroy(): Promise<void>;
}
