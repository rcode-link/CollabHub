/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserResource } from '../models/UserResource';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UserService {
    /**
     * Display a listing of the resource
     * @returns string
     * @throws ApiError
     */
    public static apiusersIndex(): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/users',
        });
    }
    /**
     * Store a newly created resource in storage
     * @param requestBody
     * @returns string
     * @throws ApiError
     */
    public static apiusersStore(
        requestBody?: Record<string, any>,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/users',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Display the specified resource
     * @param id
     * @returns any `UserResource`
     * @throws ApiError
     */
    public static apiusersShow(
        id: number,
    ): CancelablePromise<{
        data: UserResource;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/users/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Remove the specified resource from storage
     * @param id
     * @param requestBody
     * @returns any `UserResource`
     * @throws ApiError
     */
    public static apiusersDestroy(
        id: number,
        requestBody?: Record<string, any>,
    ): CancelablePromise<{
        data: UserResource;
    }> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/users/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Update the specified resource in storage
     * @param user The user ID
     * @param requestBody
     * @returns any `UserResource`
     * @throws ApiError
     */
    public static apiusersUpdate(
        user: number,
        requestBody?: {
            manager_id?: number;
        },
    ): CancelablePromise<{
        data: UserResource;
    }> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/users/{user}',
            path: {
                'user': user,
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
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static apiapiUpdatePassword(
        requestBody?: {
            current_password: string;
            password: string;
            password_confirmation: string;
        },
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/user/change-password',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                403: `Authorization error`,
                422: `Validation error`,
            },
        });
    }
}
