/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class VacationRequestService {
    /**
     * @param event The event ID
     * @param requestBody
     * @returns string
     * @throws ApiError
     */
    public static vacationRequest(
        event: number,
        requestBody?: {
            status?: 'accept' | 'decline';
        },
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/vacation/{event}',
            path: {
                'event': event,
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
}
