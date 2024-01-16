/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TaskResource } from '../models/TaskResource';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TaskService {
    /**
     * @param taskId
     * @returns any Array of `TaskResource`
     * @throws ApiError
     */
    public static taskGetRelations(
        taskId: string,
    ): CancelablePromise<{
        data: Array<TaskResource>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/task/load/{taskId}/relations',
            path: {
                'taskId': taskId,
            },
        });
    }
    /**
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static taskAddTaskToSprint(
        requestBody?: {
            task_id: number;
            sprint_id: number;
        },
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/sprint/tasks',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation error`,
            },
        });
    }
    /**
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static taskRemoveFromSPrint(
        requestBody?: {
            task_id: number;
            sprint_id: number;
        },
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/sprint/tasks',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation error`,
            },
        });
    }
    /**
     * @param sprintId
     * @param projectId
     * @returns any Array of `TaskResource`
     * @throws ApiError
     */
    public static taskTasksForSprint(
        sprintId: number,
        projectId: number,
    ): CancelablePromise<{
        data: Array<TaskResource>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/sprint/tasks',
            query: {
                'sprint_id': sprintId,
                'project_id': projectId,
            },
            errors: {
                422: `Validation error`,
            },
        });
    }
    /**
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static taskChangeTaskStatus(
        requestBody?: {
            task_id: number;
            sprint_id?: number;
            status_id: string;
        },
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/tasks/change-status',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation error`,
            },
        });
    }
    /**
     * @returns any Array of `TaskResource`
     * @throws ApiError
     */
    public static taskSearch(): CancelablePromise<{
        data: Array<TaskResource>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/tasks/search',
        });
    }
    /**
     * Display a listing of the resource
     * @returns any Array of `TaskResource`
     * @throws ApiError
     */
    public static apitasksIndex(): CancelablePromise<{
        data: Array<TaskResource>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/tasks',
        });
    }
    /**
     * Store a newly created resource in storage
     * @param requestBody
     * @returns any `TaskResource`
     * @throws ApiError
     */
    public static apitasksStore(
        requestBody?: {
            name: string;
            description?: string | null;
            created_by?: number;
            user_id?: number;
            type_id: number;
            project_id: number;
            due_date?: string | null;
            related_tasks?: any[] | null;
            tags?: any[] | null;
        },
    ): CancelablePromise<{
        data: TaskResource;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/tasks',
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
     * @param taskId
     * @returns any `TaskResource`
     * @throws ApiError
     */
    public static apitasksShow(
        taskId: string,
    ): CancelablePromise<{
        data: TaskResource;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/tasks/{task_id}',
            path: {
                'task_id': taskId,
            },
        });
    }
    /**
     * Update the specified resource in storage
     * @param taskId
     * @param requestBody
     * @returns string
     * @throws ApiError
     */
    public static apitasksUpdate(
        taskId: string,
        requestBody?: {
            name?: string | null;
            user_id?: number;
            status_id?: number;
            type_id?: number;
            description?: string | null;
            due_date?: string | null;
            related_tasks?: any[] | null;
            tags?: any[] | null;
        },
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/tasks/{task_id}',
            path: {
                'task_id': taskId,
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
     * @param task The task ID
     * @param requestBody
     * @returns string
     * @throws ApiError
     */
    public static apitasksDestroy(
        task: number,
        requestBody?: Record<string, any>,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/tasks/{task}',
            path: {
                'task': task,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Not found`,
            },
        });
    }
}
