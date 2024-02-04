/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { InvoiceResource } from '../models/InvoiceResource';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class InvoiceService {
    /**
     * @param invoice The invoice ID
     * @returns string
     * @throws ApiError
     */
    public static invoiceDownload(
        invoice: number,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/invoices/{invoice}/download',
            path: {
                'invoice': invoice,
            },
            errors: {
                404: `Not found`,
            },
        });
    }
    /**
     * Display a listing of the resource
     * @returns any Array of `InvoiceResource`
     * @throws ApiError
     */
    public static apiinvoicesIndex(): CancelablePromise<{
        data: Array<InvoiceResource>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/invoices',
        });
    }
    /**
     * Store a newly created resource in storage
     * @param requestBody
     * @returns any `InvoiceResource`
     * @throws ApiError
     */
    public static apiinvoicesStore(
        requestBody?: {
            number: string;
            date: string;
            due_date: string;
            company_id: number;
        },
    ): CancelablePromise<{
        data: InvoiceResource;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/invoices',
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
     * @param invoice The invoice ID
     * @returns any `InvoiceResource`
     * @throws ApiError
     */
    public static apiinvoicesShow(
        invoice: number,
    ): CancelablePromise<{
        data: InvoiceResource;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/invoices/{invoice}',
            path: {
                'invoice': invoice,
            },
            errors: {
                404: `Not found`,
            },
        });
    }
    /**
     * Update the specified resource in storage
     * @param invoice The invoice ID
     * @param requestBody
     * @returns string
     * @throws ApiError
     */
    public static apiinvoicesUpdate(
        invoice: number,
        requestBody?: {
            number?: string | null;
            date?: string | null;
            due_date?: string | null;
            note?: string | null;
            sent?: boolean | null;
        },
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/invoices/{invoice}',
            path: {
                'invoice': invoice,
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
     * @param invoice The invoice ID
     * @param requestBody
     * @returns string
     * @throws ApiError
     */
    public static apiinvoicesDestroy(
        invoice: number,
        requestBody?: Record<string, any>,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/invoices/{invoice}',
            path: {
                'invoice': invoice,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Not found`,
            },
        });
    }
}
