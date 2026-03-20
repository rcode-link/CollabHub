import type { AbstractType, YArrayEvent } from 'yjs';
import * as Y from 'yjs';
import { HocuspocusProvider, HocuspocusProviderConfiguration } from './HocuspocusProvider.js';
import { TiptapCollabProviderWebsocket } from './TiptapCollabProviderWebsocket.js';
import { type DeleteCommentOptions, type DeleteThreadOptions, type GetThreadsOptions, type TCollabComment, type TCollabThread, type THistoryVersion } from './types.js';
export type TiptapCollabProviderConfiguration = Required<Pick<HocuspocusProviderConfiguration, 'name'>> & Partial<HocuspocusProviderConfiguration> & (Required<Pick<AdditionalTiptapCollabProviderConfiguration, 'websocketProvider'>> | Required<Pick<AdditionalTiptapCollabProviderConfiguration, 'appId'>> | Required<Pick<AdditionalTiptapCollabProviderConfiguration, 'baseUrl'>>) & Pick<AdditionalTiptapCollabProviderConfiguration, 'user'> & {
    /**
     * Pass `true` if you want to delete a thread when the first comment is deleted.
     */
    deleteThreadOnFirstCommentDelete?: boolean;
};
export interface AdditionalTiptapCollabProviderConfiguration {
    /**
     * A Hocuspocus Cloud App ID, get one here: https://cloud.tiptap.dev
     */
    appId?: string;
    /**
     * If you are using the on-premise version of TiptapCollab, put your baseUrl here (e.g. https://collab.yourdomain.com)
     */
    baseUrl?: string;
    websocketProvider?: TiptapCollabProviderWebsocket;
    user?: string;
}
export declare class TiptapCollabProvider extends HocuspocusProvider {
    tiptapCollabConfigurationPrefix: string;
    userData?: Y.PermanentUserData;
    constructor(configuration: TiptapCollabProviderConfiguration);
    /**
     * note: this will only work if your server loaded @hocuspocus-pro/extension-history, or if you are on a Tiptap business plan.
     */
    createVersion(name?: string): void;
    /**
     * note: this will only work if your server loaded @hocuspocus-pro/extension-history, or if you are on a Tiptap business plan.
     */
    revertToVersion(targetVersion: number): void;
    /**
     * note: this will only work if your server loaded @hocuspocus-pro/extension-history, or if you are on a Tiptap business plan.
     *
     * The server will reply with a stateless message (THistoryVersionPreviewEvent)
     */
    previewVersion(targetVersion: number): void;
    /**
     * note: this will only work if your server loaded @hocuspocus-pro/extension-history, or if you are on a Tiptap business plan.
     */
    getVersions(): THistoryVersion[];
    watchVersions(callback: Parameters<AbstractType<YArrayEvent<THistoryVersion>>['observe']>[0]): void;
    unwatchVersions(callback: Parameters<AbstractType<YArrayEvent<THistoryVersion>>['unobserve']>[0]): void;
    isAutoVersioning(): boolean;
    enableAutoVersioning(): 1;
    disableAutoVersioning(): 0;
    /**
     * Returns all users in the document as Y.Map objects
     * @returns An array of Y.Map objects
     */
    private getYThreads;
    /**
     * Finds all threads in the document and returns them as JSON objects
     * @options Options to control the output of the threads (e.g. include deleted threads)
     * @returns An array of threads as JSON objects
     */
    getThreads<Data, CommentData>(options?: GetThreadsOptions): TCollabThread<Data, CommentData>[];
    /**
     * Find the index of a thread by its id
     * @param id The thread id
     * @returns The index of the thread or null if not found
     */
    private getThreadIndex;
    /**
     * Gets a single thread by its id
     * @param id The thread id
     * @returns The thread as a JSON object or null if not found
     */
    getThread<Data, CommentData>(id: string): TCollabThread<Data, CommentData> | null;
    /**
     * Gets a single thread by its id as a Y.Map object
     * @param id The thread id
     * @returns The thread as a Y.Map object or null if not found
     */
    private getYThread;
    /**
     * Create a new thread
     * @param data The thread data
     * @returns The created thread
     */
    createThread(data: Omit<TCollabThread, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'comments' | 'deletedComments'>): TCollabThread;
    /**
     * Update a specific thread
     * @param id The thread id
     * @param data New data for the thread
     * @returns The updated thread or null if the thread is not found
     */
    updateThread(id: TCollabThread['id'], data: Partial<Pick<TCollabThread, 'data'> & {
        resolvedAt: TCollabThread['resolvedAt'] | null;
    }>): TCollabThread;
    /**
     * Handle the deletion of a thread. By default, the thread and it's comments are not deleted, but marked as deleted
     * via the `deletedAt` property. Forceful deletion can be enabled by setting the `force` option to `true`.
     *
     * If you only want to delete the comments of a thread, you can set the `deleteComments` option to `true`.
     * @param id The thread id
     * @param options A set of options that control how the thread is deleted
     * @returns The deleted thread or null if the thread is not found
     */
    deleteThread(id: TCollabThread['id'], options?: DeleteThreadOptions): TCollabThread | null | undefined;
    /**
     * Tries to restore a deleted thread
     * @param id The thread id
     * @returns The restored thread or null if the thread is not found
     */
    restoreThread(id: TCollabThread['id']): TCollabThread | null;
    /**
     * Returns comments from a thread, either deleted or not
     * @param threadId The thread id
     * @param includeDeleted If you want to include deleted comments, defaults to `false`
     * @returns The comments or null if the thread is not found
     */
    getThreadComments(threadId: TCollabThread['id'], includeDeleted?: boolean): TCollabComment[] | null;
    /**
     * Get a single comment from a specific thread
     * @param threadId The thread id
     * @param commentId The comment id
     * @param includeDeleted If you want to include deleted comments in the search
     * @returns The comment or null if not found
     */
    getThreadComment(threadId: TCollabThread['id'], commentId: TCollabComment['id'], includeDeleted?: boolean): TCollabComment | null;
    /**
     * Adds a comment to a thread
     * @param threadId The thread id
     * @param data The comment data
     * @returns The updated thread or null if the thread is not found
     * @example addComment('123', { content: 'Hello world', data: { author: 'Maria Doe' } })
     */
    addComment(threadId: TCollabThread['id'], data: Omit<TCollabComment, 'id' | 'updatedAt' | 'createdAt'>): TCollabThread;
    /**
     * Update a comment in a thread
     * @param threadId The thread id
     * @param commentId The comment id
     * @param data The new comment data
     * @returns The updated thread or null if the thread or comment is not found
     * @example updateComment('123', { content: 'The new content', data: { attachments: ['file1.jpg'] }})
     */
    updateComment(threadId: TCollabThread['id'], commentId: TCollabComment['id'], data: Partial<Pick<TCollabComment, 'data' | 'content'>>): TCollabThread;
    /**
     * Deletes a comment from a thread
     * @param threadId The thread id
     * @param commentId The comment id
     * @param options A set of options that control how the comment is deleted
     * @returns The updated thread or null if the thread or comment is not found
     */
    deleteComment(threadId: TCollabThread['id'], commentId: TCollabComment['id'], options?: DeleteCommentOptions): TCollabThread | null | undefined;
    /**
     * Start watching threads for changes
     * @param callback The callback function to be called when a thread changes
     */
    watchThreads(callback: () => void): void;
    /**
     * Stop watching threads for changes
     * @param callback The callback function to be removed
     */
    unwatchThreads(callback: () => void): void;
}
