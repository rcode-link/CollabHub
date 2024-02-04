/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { InvoiceData } from '../models/InvoiceData';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class InvoiceDataService {
    /**
     * Display a listing of the resource
     * @returns string
     * @throws ApiError
     */
    public static apidataIndex(): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/invoice/data',
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
    public static apidataStore(
        requestBody?: {
            type: InvoiceData;
            data?: Array<string>;
        },
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/invoice/data',
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
     * @param invoiceData The invoice data ID
     * @returns string
     * @throws ApiError
     */
    public static apidataShow(
        invoiceData: number,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/invoice/data/{invoiceData}',
            path: {
                'invoiceData': invoiceData,
            },
            errors: {
                404: `Not found`,
            },
        });
    }
    /**
     * Update the specified resource in storage
     * @param data The data ID
     * @param requestBody
     * @returns string
     * @throws ApiError
     */
    public static apidataUpdate(
        data: number,
        requestBody?: {
            type: InvoiceData;
            data?: Array<string>;
        },
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/invoice/data/{data}',
            path: {
                'data': data,
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
     * @param data The data ID
     * @param requestBody
     * @returns string
     * @throws ApiError
     */
    public static apidataDestroy(
        data: number,
        requestBody?: Record<string, any>,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/invoice/data/{data}',
            path: {
                'data': data,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Not found`,
            },
        });
    }
}
