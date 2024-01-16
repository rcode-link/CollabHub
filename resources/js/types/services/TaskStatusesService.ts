/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TaskStatusResource } from '../models/TaskStatusResource';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TaskStatusesService {
    /**
     * Display a listing of the resource
     * @returns any Array of `TaskStatusResource`
     * @throws ApiError
     */
    public static apitasksStatusesIndex(): CancelablePromise<{
        data: Array<TaskStatusResource>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/tasks-statuses',
        });
    }
    /**
     * Store a newly created resource in storage
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static apitasksStatusesStore(
        requestBody?: {
            title?: string;
            project_id?: number;
            board_id?: number;
        },
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/tasks-statuses',
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
     * @param taskStatuses The task statuses ID
     * @returns string
     * @throws ApiError
     */
    public static apitasksStatusesShow(
        taskStatuses: number,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/tasks-statuses/{taskStatuses}',
            path: {
                'taskStatuses': taskStatuses,
            },
            errors: {
                404: `Not found`,
            },
        });
    }
    /**
     * Remove the specified resource from storage
     * @param taskStatuses The task statuses ID
     * @param requestBody
     * @returns string
     * @throws ApiError
     */
    public static apitasksStatusesDestroy(
        taskStatuses: number,
        requestBody?: Record<string, any>,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/tasks-statuses/{taskStatuses}',
            path: {
                'taskStatuses': taskStatuses,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Not found`,
            },
        });
    }
    /**
     * Update the specified resource in storage
     * @param tasksStatus The tasks status ID
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static apitasksStatusesUpdate(
        tasksStatus: number,
        requestBody?: {
            order?: number;
            title?: string;
            open?: boolean;
        },
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/tasks-statuses/{tasks_status}',
            path: {
                'tasks_status': tasksStatus,
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
