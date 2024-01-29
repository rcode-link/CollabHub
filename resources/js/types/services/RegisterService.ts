/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RegisterService {
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static apiapiRegister(
        requestBody?: {
            email: string;
            name: string;
            id?: string;
            password: string;
            password_confirmation: string;
        },
    ): CancelablePromise<{
        status: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/register',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                403: `Authorization error`,
                422: `Validation error`,
            },
        });
    }
}
