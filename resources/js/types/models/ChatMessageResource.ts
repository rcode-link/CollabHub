/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MediaResource } from './MediaResource';
import type { MessageReactionResouce } from './MessageReactionResouce';
import type { UserResource } from './UserResource';
import type { VideoCalls } from './VideoCalls';
export type ChatMessageResource = {
    id: number;
    message: string | null;
    createdAt: any | null;
    isEdited: string;
    media?: Array<MediaResource>;
    user?: UserResource;
    videocall?: VideoCalls;
    parent_id: number | null;
    reactions?: Array<MessageReactionResouce>;
    parent?: {
        text: string | null;
        id: number;
    };
};

