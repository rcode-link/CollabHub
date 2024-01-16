/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PusherService {
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static pusherWebhook(
        requestBody?: Record<string, any>,
    ): CancelablePromise<{
        data: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/webhook',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
