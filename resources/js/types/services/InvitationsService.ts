/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { InvitationResource } from '../models/InvitationResource';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class InvitationsService {
    /**
     * Display a listing of the resource
     * @returns any Array of `InvitationResource`
     * @throws ApiError
     */
    public static apiinviteIndex(): CancelablePromise<{
        data: Array<InvitationResource>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/company/invite',
        });
    }
    /**
     * Store a newly created resource in storage
     * @param requestBody
     * @returns string
     * @throws ApiError
     */
    public static apiinviteStore(
        requestBody?: Record<string, any>,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/company/invite',
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
     * @param invitations The invitations ID
     * @returns string
     * @throws ApiError
     */
    public static apiinviteShow(
        invitations: number,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/company/invite/{invitations}',
            path: {
                'invitations': invitations,
            },
            errors: {
                404: `Not found`,
            },
        });
    }
    /**
     * Update the specified resource in storage
     * @param invitations The invitations ID
     * @param requestBody
     * @returns string
     * @throws ApiError
     */
    public static apiinviteUpdate(
        invitations: number,
        requestBody?: Record<string, any>,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/company/invite/{invitations}',
            path: {
                'invitations': invitations,
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
     * @param invite The invite ID
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static apiinviteDestroy(
        invite: number,
        requestBody?: Record<string, any>,
    ): CancelablePromise<{
        status: string;
    }> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/company/invite/{invite}',
            path: {
                'invite': invite,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Not found`,
            },
        });
    }
}
