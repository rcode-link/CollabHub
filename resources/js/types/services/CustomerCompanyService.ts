/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CustomerResource } from '../models/CustomerResource';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CustomerCompanyService {
    /**
     * Display a listing of the resource
     * @returns any Array of `CustomerResource`
     * @throws ApiError
     */
    public static apicustomersIndex(): CancelablePromise<{
        data: Array<CustomerResource>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/customers',
        });
    }
    /**
     * Store a newly created resource in storage
     * @param requestBody
     * @returns string
     * @throws ApiError
     */
    public static apicustomersStore(
        requestBody?: {
            name: string;
            prefix: string;
            address: string;
            city: string;
            zip: string;
            country: string;
            billing_address?: string | null;
            billing_city?: string | null;
            billing_zip?: string | null;
            billing_country?: string | null;
        },
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/customers',
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
     * @param id
     * @returns any `CustomerResource`
     * @throws ApiError
     */
    public static apicustomersShow(
        id: string,
    ): CancelablePromise<{
        data: CustomerResource;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/customers/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Update the specified resource in storage
     * @param id
     * @param requestBody
     * @returns string
     * @throws ApiError
     */
    public static apicustomersUpdate(
        id: string,
        requestBody?: Record<string, any>,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/customers/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Remove the specified resource from storage
     * @param id
     * @param requestBody
     * @returns string
     * @throws ApiError
     */
    public static apicustomersDestroy(
        id: string,
        requestBody?: Record<string, any>,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/customers/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
