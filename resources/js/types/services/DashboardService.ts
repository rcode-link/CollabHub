/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ChatResource } from '../models/ChatResource';
import type { TaskResource } from '../models/TaskResource';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DashboardService {
    /**
     * @returns any Array of `ChatResource`
     * @throws ApiError
     */
    public static apiapiUnreadMessages(): CancelablePromise<{
        data: Array<ChatResource>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/dashboard/messages',
        });
    }
    /**
     * @returns any Array of `TaskResource`
     * @throws ApiError
     */
    public static apiapiOpenTasks(): CancelablePromise<{
        data: Array<TaskResource>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/dashboard/tasks',
        });
    }
}
