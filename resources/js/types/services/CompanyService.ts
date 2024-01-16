/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Company } from '../models/Company';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CompanyService {
    /**
     * @returns string
     * @throws ApiError
     */
    public static companyGetKeys(): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/get-organization-keys',
        });
    }
    /**
     * Return company for user
     * @returns string
     * @throws ApiError
     */
    public static apicompaniesIndex(): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/companies',
        });
    }
    /**
     * Store a newly created resource in storage
     * @param requestBody
     * @returns string
     * @throws ApiError
     */
    public static apicompaniesStore(
        requestBody?: Record<string, any>,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/companies',
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
     * @param company The company ID
     * @returns string
     * @throws ApiError
     */
    public static apicompaniesShow(
        company: number,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/companies/{company}',
            path: {
                'company': company,
            },
            errors: {
                403: `Authorization error`,
                404: `Not found`,
            },
        });
    }
    /**
     * Update the specified resource in storage
     * @param company The company ID
     * @param formData
     * @returns Company `Company`
     * @throws ApiError
     */
    public static apicompaniesUpdate(
        company: number,
        formData?: {
            name?: string;
            avatar?: Blob | null;
        },
    ): CancelablePromise<Company> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/companies/{company}',
            path: {
                'company': company,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                403: `Authorization error`,
                404: `Not found`,
                422: `Validation error`,
            },
        });
    }
    /**
     * Remove the specified resource from storage
     * @param company The company ID
     * @param requestBody
     * @returns string
     * @throws ApiError
     */
    public static apicompaniesDestroy(
        company: number,
        requestBody?: Record<string, any>,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/companies/{company}',
            path: {
                'company': company,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Not found`,
            },
        });
    }
    /**
     * Update the specified resource in storage
     * @param company The company ID
     * @param formData
     * @returns Company `Company`
     * @throws ApiError
     */
    public static companyUpdate3(
        company: number,
        formData?: {
            name?: string;
            avatar?: Blob | null;
        },
    ): CancelablePromise<Company> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/companies/{company}',
            path: {
                'company': company,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                403: `Authorization error`,
                404: `Not found`,
                422: `Validation error`,
            },
        });
    }
}
