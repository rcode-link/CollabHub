/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserResource } from '../models/UserResource';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ProfileService {
    /**
     * @returns any `UserResource`
     * @throws ApiError
     */
    public static profileView(): CancelablePromise<{
        data: UserResource;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/user',
        });
    }
    /**
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static profileUpdate(
        requestBody?: {
            name: string;
            email?: string;
        },
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/user',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation error`,
            },
        });
    }
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static profileUpdateProfilePicture(
        requestBody?: Record<string, any>,
    ): CancelablePromise<{
        data: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/user/update-profile-picture',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
