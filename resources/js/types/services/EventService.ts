/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '@/types/core/CancelablePromise';
import { OpenAPI } from '@/types/core/OpenAPI';
import { request as __request } from '@/types/core/request';
export class EventService {
    /**
     * @param id
     * @param requestBody
     * @returns string
     * @throws ApiError
     */
    public static apiapiCalendarUpdateEvent(
        id: string,
        requestBody?: Record<string, any>,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/event/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
