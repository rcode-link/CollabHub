/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class FileService {
    /**
     * Display a listing of the resource
     * @returns string
     * @throws ApiError
     */
    public static apifilesIndex(): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/files',
        });
    }
    /**
     * Store a newly created resource in storage
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static apifilesStore(
        requestBody?: {
            title: string;
            content?: any[] | null;
            parent_id?: number;
            type: 'folder' | 'file';
            entity_id?: number;
            entity_type?: string;
        },
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/files',
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
     * @param files
     * @returns string
     * @throws ApiError
     */
    public static apifilesShow(
        files: string,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/files/{files}',
            path: {
                'files': files,
            },
        });
    }
    /**
     * Update the specified resource in storage
     * @param file
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static apifilesUpdate(
        file: string,
        requestBody?: {
            title: string;
            content?: any[] | null;
            parent_id?: number;
        },
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/files/{file}',
            path: {
                'file': file,
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
     * @param file The file ID
     * @param requestBody
     * @returns string
     * @throws ApiError
     */
    public static apifilesDestroy(
        file: number,
        requestBody?: Record<string, any>,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/files/{file}',
            path: {
                'file': file,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Not found`,
            },
        });
    }
}
