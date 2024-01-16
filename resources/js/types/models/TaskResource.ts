/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MediaResource } from './MediaResource';
import type { TaskType } from './TaskType';
import type { UserResource } from './UserResource';
export type TaskResource = {
    id: number;
    name: string;
    task_id: string | null;
    project_id: number;
    user?: UserResource;
    createdBy?: UserResource;
    description: string | null;
    status?: string;
    type?: TaskType;
    children_count: string;
    relation?: string;
    sprints?: string;
    chat_id?: number;
    due_date: string;
    tags: string | null;
    media?: Array<MediaResource>;
};

