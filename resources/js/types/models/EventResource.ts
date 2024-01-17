/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserResource } from './UserResource';
export type EventResource = {
    summary: string;
    id: number;
    start_time: string;
    end_time: string;
    freq: string | null;
    user_id: number;
    description: string | null;
    freq_settings: string | null;
    freq_until: string | null;
    type: string;
    approved: boolean;
    videocall?: {
        slug: string | null;
    };
    creator?: UserResource;
    attendance?: string;
};

