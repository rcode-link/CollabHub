/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TaskRelationResource } from '../models/TaskRelationResource';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TaskRelationService {
    /**
     * Display a listing of the resource
     * @returns any Array of `TaskRelationResource`
     * @throws ApiError
     */
    public static apirelationsIndex(): CancelablePromise<{
        data: Array<TaskRelationResource>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/task/relations',
        });
    }
    /**
     * Store a newly created resource in storage
     * @param requestBody
     * @returns string
     * @throws ApiError
     */
    public static apirelationsStore(
        requestBody?: Record<string, any>,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/task/relations',
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
     * @param taskRelation The task relation ID
     * @returns string
     * @throws ApiError
     */
    public static apirelationsShow(
        taskRelation: number,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/task/relations/{taskRelation}',
            path: {
                'taskRelation': taskRelation,
            },
            errors: {
                404: `Not found`,
            },
        });
    }
    /**
     * Update the specified resource in storage
     * @param taskRelation The task relation ID
     * @param requestBody
     * @returns string
     * @throws ApiError
     */
    public static apirelationsUpdate(
        taskRelation: number,
        requestBody?: Record<string, any>,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/task/relations/{taskRelation}',
            path: {
                'taskRelation': taskRelation,
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
     * @param taskRelation The task relation ID
     * @param requestBody
     * @returns string
     * @throws ApiError
     */
    public static apirelationsDestroy(
        taskRelation: number,
        requestBody?: Record<string, any>,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/task/relations/{taskRelation}',
            path: {
                'taskRelation': taskRelation,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Not found`,
            },
        });
    }
}
