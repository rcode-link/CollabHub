/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserResource } from '../models/UserResource';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CompanyUsersService {
    /**
     * @param company The company ID
     * @returns any Array of `UserResource`
     * @throws ApiError
     */
    public static apiapiIndex(
        company: number,
    ): CancelablePromise<{
        data: Array<UserResource>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/company/users/{company}',
            path: {
                'company': company,
            },
            errors: {
                404: `Not found`,
            },
        });
    }
    /**
     * @param requestBody
     * @returns string
     * @throws ApiError
     */
    public static apiapiInvite(
        requestBody?: Record<string, any>,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/company/users/invite',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
