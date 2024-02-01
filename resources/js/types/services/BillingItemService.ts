/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BillingItemResource } from '../models/BillingItemResource';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class BillingItemService {
    /**
     * Display a listing of the resource
     * @returns any Array of `BillingItemResource`
     * @throws ApiError
     */
    public static apibillingItemsIndex(): CancelablePromise<{
        data: Array<BillingItemResource>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/billing-items',
        });
    }
    /**
     * Store a newly created resource in storage
     * @param requestBody
     * @returns string
     * @throws ApiError
     */
    public static apibillingItemsStore(
        requestBody?: Record<string, any>,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/billing-items',
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
     * @param billingItem The billing item ID
     * @returns string
     * @throws ApiError
     */
    public static apibillingItemsShow(
        billingItem: number,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/billing-items/{billingItem}',
            path: {
                'billingItem': billingItem,
            },
            errors: {
                404: `Not found`,
            },
        });
    }
    /**
     * Update the specified resource in storage
     * @param billingItem The billing item ID
     * @param requestBody
     * @returns string
     * @throws ApiError
     */
    public static apibillingItemsUpdate(
        billingItem: number,
        requestBody?: Record<string, any>,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/billing-items/{billingItem}',
            path: {
                'billingItem': billingItem,
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
     * @param billingItem The billing item ID
     * @param requestBody
     * @returns string
     * @throws ApiError
     */
    public static apibillingItemsDestroy(
        billingItem: number,
        requestBody?: Record<string, any>,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/billing-items/{billingItem}',
            path: {
                'billingItem': billingItem,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Not found`,
            },
        });
    }
}
