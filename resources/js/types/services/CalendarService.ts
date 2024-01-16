/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EventResource } from '../models/EventResource';
import type { EventTypes } from '../models/EventTypes';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CalendarService {
    /**
     * @returns any Array of `EventResource`
     * @throws ApiError
     */
    public static calendarGetMyEvents(): CancelablePromise<{
        data: Array<EventResource>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/calendar',
        });
    }
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static calendarInsertCalendarItem(
        requestBody?: {
            summary: string;
            description?: string | null;
            start_time?: string;
            end_time?: string;
            freq?: 'WEEKLY' | 'DAILY';
            freq_settings?: string | null;
            freq_until?: string;
            has_video?: boolean;
            type?: EventTypes;
            users?: Array<number>;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/calendar',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                403: `Authorization error`,
                422: `Validation error`,
            },
        });
    }
    /**
     * @param event The event ID
     * @param requestBody
     * @returns string
     * @throws ApiError
     */
    public static calendarUpdate(
        event: number,
        requestBody?: {
            summary: string;
            description?: string | null;
            start_time?: string;
            end_time?: string;
            freq?: 'WEEKLY' | 'DAILY';
            freq_settings?: string | null;
            freq_until?: string;
            has_video?: boolean;
            type?: EventTypes;
            users?: Array<number>;
        },
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/calendar/{event}',
            path: {
                'event': event,
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
     * @param event The event ID
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static calendarDestroy(
        event: number,
        requestBody?: Record<string, any>,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/calendar/{event}',
            path: {
                'event': event,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Not found`,
            },
        });
    }
    /**
     * @param event The event ID
     * @returns any `EventResource`
     * @throws ApiError
     */
    public static calendarView(
        event: number,
    ): CancelablePromise<{
        data: EventResource;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/event/{event}',
            path: {
                'event': event,
            },
            errors: {
                404: `Not found`,
            },
        });
    }
}
