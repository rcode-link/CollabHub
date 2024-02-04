/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CurrencyResource } from '../models/CurrencyResource';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CurrencyService {
    /**
     * Display a listing of the resource
     * @returns any Array of `CurrencyResource`
     * @throws ApiError
     */
    public static apicurrencyIndex(): CancelablePromise<{
        data: Array<CurrencyResource>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/currency',
        });
    }
    /**
     * Store a newly created resource in storage
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static apicurrencyStore(
        requestBody?: {
            currency: string;
            format: string;
            iso: string;
        },
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/currency',
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
     * @param currency The currency ID
     * @returns string
     * @throws ApiError
     */
    public static apicurrencyShow(
        currency: number,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/currency/{currency}',
            path: {
                'currency': currency,
            },
            errors: {
                404: `Not found`,
            },
        });
    }
    /**
     * Update the specified resource in storage
     * @param currency The currency ID
     * @param requestBody
     * @returns string
     * @throws ApiError
     */
    public static apicurrencyUpdate(
        currency: number,
        requestBody?: Record<string, any>,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/currency/{currency}',
            path: {
                'currency': currency,
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
     * @param currency The currency ID
     * @param requestBody
     * @returns string
     * @throws ApiError
     */
    public static apicurrencyDestroy(
        currency: number,
        requestBody?: Record<string, any>,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/currency/{currency}',
            path: {
                'currency': currency,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Not found`,
            },
        });
    }
}
