/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UserResource = {
    id: number;
    name: string;
    email: string;
    avatar: string;
    start_work_time: string | null;
    end_work_time: string | null;
    deleted_at: string | null;
    manager?: UserResource;
    view_profile?: string;
    availability: string;
    attending?: string;
};

