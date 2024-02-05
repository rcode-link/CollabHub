/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaymentResource } from '../models/PaymentResource';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PaymentService {
    /**
     * Display a listing of the resource
     * @returns any Array of `PaymentResource`
     * @throws ApiError
     */
    public static apipaymentsIndex(): CancelablePromise<{
        data: Array<PaymentResource>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/payments',
        });
    }
    /**
     * Store a newly created resource in storage
     * @param requestBody
     * @returns string
     * @throws ApiError
     */
    public static apipaymentsStore(
        requestBody?: {
            invoice_id: number;
            value?: number;
            date?: string;
        },
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/payments',
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
     * @param payment The payment ID
     * @returns string
     * @throws ApiError
     */
    public static apipaymentsShow(
        payment: number,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/payments/{payment}',
            path: {
                'payment': payment,
            },
            errors: {
                404: `Not found`,
            },
        });
    }
    /**
     * Update the specified resource in storage
     * @param payment The payment ID
     * @param requestBody
     * @returns string
     * @throws ApiError
     */
    public static apipaymentsUpdate(
        payment: number,
        requestBody?: Record<string, any>,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/payments/{payment}',
            path: {
                'payment': payment,
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
     * @param payment The payment ID
     * @param requestBody
     * @returns string
     * @throws ApiError
     */
    public static apipaymentsDestroy(
        payment: number,
        requestBody?: Record<string, any>,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/payments/{payment}',
            path: {
                'payment': payment,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Not found`,
            },
        });
    }
}
