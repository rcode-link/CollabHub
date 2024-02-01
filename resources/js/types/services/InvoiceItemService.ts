/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class InvoiceItemService {
    /**
     * Display a listing of the resource
     * @returns string
     * @throws ApiError
     */
    public static apiinvoicesItemsIndex(): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/invoices-items',
        });
    }
    /**
     * Store a newly created resource in storage
     * @param requestBody
     * @returns string
     * @throws ApiError
     */
    public static apiinvoicesItemsStore(
        requestBody?: Record<string, any>,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/invoices-items',
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
     * @param invoiceItem The invoice item ID
     * @returns string
     * @throws ApiError
     */
    public static apiinvoicesItemsShow(
        invoiceItem: number,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/invoices-items/{invoiceItem}',
            path: {
                'invoiceItem': invoiceItem,
            },
            errors: {
                404: `Not found`,
            },
        });
    }
    /**
     * Update the specified resource in storage
     * @param invoiceItem
     * @param requestBody
     * @returns string
     * @throws ApiError
     */
    public static apiinvoicesItemsUpdate(
        invoiceItem: string,
        requestBody?: Record<string, any>,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/invoices-items/{invoiceItem}',
            path: {
                'invoiceItem': invoiceItem,
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
     * @param id
     * @param requestBody
     * @returns string
     * @throws ApiError
     */
    public static apiinvoicesItemsDestroy(
        id: string,
        requestBody?: Record<string, any>,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/invoices-items/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
