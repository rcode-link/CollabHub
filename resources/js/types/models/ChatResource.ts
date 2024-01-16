/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ChatResource = {
    id: number;
    title: string;
    type: string;
    avatar: string;
    chatable_id: string;
    item_key?: (string | '');
    unreadMessages: string;
    message?: {
        text: string;
        created_at: any | null;
        user: string;
    };
};

