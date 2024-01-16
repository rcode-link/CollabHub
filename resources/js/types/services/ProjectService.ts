/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Project } from '../models/Project';
import type { ProjectResource } from '../models/ProjectResource';
import type { UserResource } from '../models/UserResource';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ProjectService {
    /**
     * Display a listing of the resource
     * @returns any Array of `ProjectResource`
     * @throws ApiError
     */
    public static apiprojectsIndex(): CancelablePromise<{
        data: Array<ProjectResource>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/projects',
        });
    }
    /**
     * Store a newly created resource in storage
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static apiprojectsStore(
        requestBody?: {
            name: string;
            key: string;
            description?: any[] | null;
        },
    ): CancelablePromise<(Array<string> | string)> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/projects',
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
     * @param project The project ID
     * @returns Project `Project`
     * @throws ApiError
     */
    public static apiprojectsShow(
        project: number,
    ): CancelablePromise<Project> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/projects/{project}',
            path: {
                'project': project,
            },
            errors: {
                404: `Not found`,
            },
        });
    }
    /**
     * Update the specified resource in storage
     * @param project The project ID
     * @param requestBody
     * @returns string
     * @throws ApiError
     */
    public static apiprojectsUpdate(
        project: number,
        requestBody?: Record<string, any>,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/projects/{project}',
            path: {
                'project': project,
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
     * @param project The project ID
     * @param requestBody
     * @returns string
     * @throws ApiError
     */
    public static apiprojectsDestroy(
        project: number,
        requestBody?: Record<string, any>,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/projects/{project}',
            path: {
                'project': project,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Not found`,
            },
        });
    }
    /**
     * @param projectId
     * @returns any Array of `UserResource`
     * @throws ApiError
     */
    public static projectGetProjectUsers(
        projectId: number,
    ): CancelablePromise<{
        data: Array<UserResource>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/users/project',
            query: {
                'project_id': projectId,
            },
            errors: {
                422: `Validation error`,
            },
        });
    }
}
