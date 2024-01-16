/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ChatMessageResource } from '../models/ChatMessageResource';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ChatMessageService {
    /**
     * @param chat The chat ID
     * @returns any Paginated set of `ChatMessageResource`
     * @throws ApiError
     */
    public static chatMessageIndex(
        chat: number,
    ): CancelablePromise<{
        data: Array<ChatMessageResource>;
        links: {
            first: string | null;
            last: string | null;
            prev: string | null;
            next: string | null;
        };
        meta: {
            current_page: number;
            from: number | null;
            last_page: number;
            /**
             * Generated paginator links.
             */
            links: Array<{
                url: string | null;
                label: string;
                active: boolean;
            }>;
            /**
             * Base path for paginator generated URLs.
             */
            path: string | null;
            /**
             * Number of items shown per page.
             */
            per_page: number;
            /**
             * Number of the last item in the slice.
             */
            to: number | null;
            /**
             * Total number of items being paginated.
             */
            total: number;
        };
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/chats/{chat}/messages',
            path: {
                'chat': chat,
            },
            errors: {
                404: `Not found`,
            },
        });
    }
    /**
     * @param chat The chat ID
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static chatMessageStore(
        chat: number,
        requestBody?: {
            message: string;
            parent_id?: number;
            files?: Array<Blob>;
        },
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/chats/{chat}/message',
            path: {
                'chat': chat,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                403: `Authorization error`,
                404: `Not found`,
                422: `Validation error`,
            },
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static chatMessageDestroy(
        id: string,
        requestBody?: Record<string, any>,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/messages/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
