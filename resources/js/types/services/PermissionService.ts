/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PermissionService {
    /**
     * List available todo items
     * @returns string
     * @throws ApiError
     */
    public static apiapiMyPermissions(): CancelablePromise<Array<string>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/permissions/my',
        });
    }
    /**
     * Display a listing of the resource
     * @returns string
     * @throws ApiError
     */
    public static apipermissionsIndex(): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/permissions',
        });
    }
    /**
     * Store a newly created resource in storage
     * @param requestBody
     * @returns string
     * @throws ApiError
     */
    public static apipermissionsStore(
        requestBody?: Record<string, any>,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/permissions',
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
     * @param permission
     * @returns string
     * @throws ApiError
     */
    public static apipermissionsShow(
        permission: number,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/permissions/{permission}',
            path: {
                'permission': permission,
            },
        });
    }
    /**
     * Update the specified resource in storage
     * @param permission
     * @param requestBody
     * @returns string
     * @throws ApiError
     */
    public static apipermissionsUpdate(
        permission: number,
        requestBody?: Record<string, any>,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/permissions/{permission}',
            path: {
                'permission': permission,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                403: `Authorization error`,
                422: `Validation error`,
            },
        });
    }
    /**
     * Remove the specified resource from storage
     * @param permission
     * @param requestBody
     * @returns string
     * @throws ApiError
     */
    public static apipermissionsDestroy(
        permission: number,
        requestBody?: Record<string, any>,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/permissions/{permission}',
            path: {
                'permission': permission,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
