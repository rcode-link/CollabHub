/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class MessageReactionService {
    /**
     * Display a listing of the resource
     * @returns string
     * @throws ApiError
     */
    public static apireactionsIndex(): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/messages/reactions',
        });
    }
    /**
     * Store a newly created resource in storage
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static apireactionsStore(
        requestBody?: {
            reaction: string;
            chat_message_id: number;
            user_id: string;
        },
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/messages/reactions',
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
     * @param messageReaction The message reaction ID
     * @returns string
     * @throws ApiError
     */
    public static apireactionsShow(
        messageReaction: number,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/messages/reactions/{messageReaction}',
            path: {
                'messageReaction': messageReaction,
            },
            errors: {
                404: `Not found`,
            },
        });
    }
    /**
     * Update the specified resource in storage
     * @param messageReaction The message reaction ID
     * @param requestBody
     * @returns string
     * @throws ApiError
     */
    public static apireactionsUpdate(
        messageReaction: number,
        requestBody?: Record<string, any>,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/messages/reactions/{messageReaction}',
            path: {
                'messageReaction': messageReaction,
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
     * @param messageReaction The message reaction ID
     * @param requestBody
     * @returns string
     * @throws ApiError
     */
    public static apireactionsDestroy(
        messageReaction: number,
        requestBody?: Record<string, any>,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/messages/reactions/{messageReaction}',
            path: {
                'messageReaction': messageReaction,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Not found`,
            },
        });
    }
}
