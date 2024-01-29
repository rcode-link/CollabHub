/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Sprint } from '../models/Sprint';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SprintService {
    /**
     * @param sprint The sprint ID
     * @param requestBody
     * @returns Sprint `Sprint`
     * @throws ApiError
     */
    public static apiapiActivate(
        sprint: number,
        requestBody?: Record<string, any>,
    ): CancelablePromise<Sprint> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/sprints/{sprint}/activate',
            path: {
                'sprint': sprint,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Not found`,
            },
        });
    }
    /**
     * Display a listing of the resource
     * @returns string
     * @throws ApiError
     */
    public static apisprintsIndex(): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/sprints',
        });
    }
    /**
     * Store a newly created resource in storage
     * @param requestBody
     * @returns string
     * @throws ApiError
     */
    public static apisprintsStore(
        requestBody?: {
            title: string;
            is_active?: boolean;
            duration: number;
            board_id: number;
        },
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/sprints',
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
     * @param sprint The sprint ID
     * @returns string
     * @throws ApiError
     */
    public static apisprintsShow(
        sprint: number,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/sprints/{sprint}',
            path: {
                'sprint': sprint,
            },
            errors: {
                404: `Not found`,
            },
        });
    }
    /**
     * Update the specified resource in storage
     * @param sprint The sprint ID
     * @param requestBody
     * @returns string
     * @throws ApiError
     */
    public static apisprintsUpdate(
        sprint: number,
        requestBody?: Record<string, any>,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/sprints/{sprint}',
            path: {
                'sprint': sprint,
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
     * @param sprint The sprint ID
     * @param requestBody
     * @returns string
     * @throws ApiError
     */
    public static apisprintsDestroy(
        sprint: number,
        requestBody?: Record<string, any>,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/sprints/{sprint}',
            path: {
                'sprint': sprint,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Not found`,
            },
        });
    }
}
