/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LoginResource } from '@/types/models/LoginResource';
import type { CancelablePromise } from '@/types/core/CancelablePromise';
import { OpenAPI } from '@/types/core/OpenAPI';
import { request as __request } from '@/types/core/request';
export class LoginService {
    /**
     * Handle the incoming request
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static apiapiLogin(
        requestBody?: {
            email: string;
            password: string;
        },
    ): CancelablePromise<({
        data: LoginResource;
    } | string)> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                403: `Authorization error`,
                422: `Validation error`,
            },
        });
    }
}
