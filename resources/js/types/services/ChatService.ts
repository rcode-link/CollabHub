/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ChatResource } from '../models/ChatResource';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ChatService {
    /**
     * @returns any
     * @throws ApiError
     */
    public static chatGetNumberOfUnreadMessages(): CancelablePromise<{
        messages: string;
        total: string;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/chats/number-of-unread-messages',
        });
    }
    /**
     * Display a listing of the resource
     * @returns any Array of `ChatResource`
     * @throws ApiError
     */
    public static apichatsIndex(): CancelablePromise<{
        data: Array<ChatResource>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/chats',
        });
    }
    /**
     * Create new chat
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static apichatsStore(
        requestBody?: {
            title?: string;
            user_id?: Array<number>;
        },
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/chats',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                403: `Authorization error`,
                422: `Validation error`,
            },
        });
    }
    /**
     * Display the specified resource
     * @param chat The chat ID
     * @returns any `ChatResource`
     * @throws ApiError
     */
    public static apichatsShow(
        chat: number,
    ): CancelablePromise<{
        data: ChatResource;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/chats/{chat}',
            path: {
                'chat': chat,
            },
            errors: {
                404: `Not found`,
            },
        });
    }
    /**
     * Update the specified resource in storage
     * @param chat The chat ID
     * @param requestBody
     * @returns string
     * @throws ApiError
     */
    public static apichatsUpdate(
        chat: number,
        requestBody?: Record<string, any>,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/chats/{chat}',
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
     * Remove the specified resource from storage
     * @param chat The chat ID
     * @param requestBody
     * @returns string
     * @throws ApiError
     */
    public static apichatsDestroy(
        chat: number,
        requestBody?: Record<string, any>,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/chats/{chat}',
            path: {
                'chat': chat,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Not found`,
            },
        });
    }
}
