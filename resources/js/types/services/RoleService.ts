/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PermissionsScopes } from '../models/PermissionsScopes';
import type { Role } from '../models/Role';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RoleService {
    /**
     * @returns string
     * @throws ApiError
     */
    public static apiapiGetResource(): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/role/resources',
        });
    }
    /**
     * @param role
     * @returns string
     * @throws ApiError
     */
    public static apiapiGetAllResources(
        role: string,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/role/resources/{role}',
            path: {
                'role': role,
            },
        });
    }
    /**
     * @param role The role ID
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static apiapiAddResource(
        role: number,
        requestBody?: {
            resource_type?: PermissionsScopes;
            resource?: number;
        },
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/role/resources/{role}',
            path: {
                'role': role,
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
     * @param role The role ID
     * @param requestBody
     * @returns string
     * @throws ApiError
     */
    public static apiapiRemoveUserFromRole(
        role: number,
        requestBody?: {
            user?: number;
        },
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/roles/detach/users/{role}',
            path: {
                'role': role,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Not found`,
                422: `Validation error`,
            },
        });
    }
    /**
     * Display a listing of the resource
     * @returns string
     * @throws ApiError
     */
    public static apirolesIndex(): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/roles',
        });
    }
    /**
     * Store a newly created resource in storage
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static apirolesStore(
        requestBody?: {
            title: string;
        },
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/roles',
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
     * @param role The role ID
     * @returns string
     * @throws ApiError
     */
    public static apirolesShow(
        role: number,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/roles/{role}',
            path: {
                'role': role,
            },
            errors: {
                404: `Not found`,
            },
        });
    }
    /**
     * Update the specified resource in storage
     * @param role The role ID
     * @param requestBody
     * @returns Role `Role`
     * @throws ApiError
     */
    public static apirolesUpdate(
        role: number,
        requestBody?: {
            title?: string | null;
            users?: any[] | null;
            permissions?: any[] | null;
        },
    ): CancelablePromise<Role> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/roles/{role}',
            path: {
                'role': role,
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
     * Remove the specified resource from storage
     * @param role The role ID
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static apirolesDestroy(
        role: number,
        requestBody?: Record<string, any>,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/roles/{role}',
            path: {
                'role': role,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Not found`,
            },
        });
    }
}
