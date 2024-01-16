/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TimeSheetService {
    /**
     * Display a listing of the resource
     * @param projectId
     * @param taskId
     * @returns string
     * @throws ApiError
     */
    public static apitimeSheetIndex(
        projectId: string,
        taskId: string,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/time-sheet',
            query: {
                'project_id': projectId,
                'task_id': taskId,
            },
            errors: {
                422: `Validation error`,
            },
        });
    }
    /**
     * Store a newly created resource in storage
     * @param requestBody
     * @returns string
     * @throws ApiError
     */
    public static apitimeSheetStore(
        requestBody?: {
            start: string;
            end: string;
            project_id: string;
            task_id: string;
        },
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/time-sheet',
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
     * @param timeSheet The time sheet ID
     * @returns string
     * @throws ApiError
     */
    public static apitimeSheetShow(
        timeSheet: number,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/time-sheet/{timeSheet}',
            path: {
                'timeSheet': timeSheet,
            },
            errors: {
                404: `Not found`,
            },
        });
    }
    /**
     * Update the specified resource in storage
     * @param timeSheet The time sheet ID
     * @param requestBody
     * @returns string
     * @throws ApiError
     */
    public static apitimeSheetUpdate(
        timeSheet: number,
        requestBody?: Record<string, any>,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/time-sheet/{timeSheet}',
            path: {
                'timeSheet': timeSheet,
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
     * @param timeSheet The time sheet ID
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static apitimeSheetDestroy(
        timeSheet: number,
        requestBody?: Record<string, any>,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/time-sheet/{timeSheet}',
            path: {
                'timeSheet': timeSheet,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Not found`,
            },
        });
    }
}
