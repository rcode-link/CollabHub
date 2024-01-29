/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class VideoCallService {
    /**
     * @param chat
     * @param requestBody
     * @returns string
     * @throws ApiError
     */
    public static apiapiStartVideoCall(
        chat: string,
        requestBody?: Record<string, any>,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/video-call/{chat}/start',
            path: {
                'chat': chat,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @param name
     * @returns any
     * @throws ApiError
     */
    public static apiapiGetGetVideoCallToken(
        id: string,
        name: string,
    ): CancelablePromise<{
        token: string;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/video-call/{id}/join',
            path: {
                'id': id,
            },
            query: {
                'name': name,
            },
            errors: {
                422: `Validation error`,
                500: `An error`,
            },
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static apiapiPutGetVideoCallToken(
        id: string,
        requestBody?: {
            name: string;
        },
    ): CancelablePromise<{
        token: string;
    }> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/video-call/{id}/join',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation error`,
                500: `An error`,
            },
        });
    }
}
