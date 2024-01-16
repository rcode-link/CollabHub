/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class BoardService {
    /**
     * Display a listing of the resource
     * @returns string
     * @throws ApiError
     */
    public static apiboardsIndex(): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/boards',
        });
    }
    /**
     * Store a newly created resource in storage
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static apiboardsStore(
        requestBody?: {
            title: string;
            type: 'scrum' | 'kanban';
            project_id: number;
        },
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/boards',
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
     * @param board The board ID
     * @returns string
     * @throws ApiError
     */
    public static apiboardsShow(
        board: number,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/boards/{board}',
            path: {
                'board': board,
            },
            errors: {
                404: `Not found`,
            },
        });
    }
    /**
     * Update the specified resource in storage
     * @param board The board ID
     * @param requestBody
     * @returns string
     * @throws ApiError
     */
    public static apiboardsUpdate(
        board: number,
        requestBody?: Record<string, any>,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/boards/{board}',
            path: {
                'board': board,
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
     * @param board The board ID
     * @param requestBody
     * @returns string
     * @throws ApiError
     */
    public static apiboardsDestroy(
        board: number,
        requestBody?: Record<string, any>,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/boards/{board}',
            path: {
                'board': board,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Not found`,
            },
        });
    }
}
