/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MediaResource } from '@/types/models/MediaResource';
import type { MessageReactionResouce } from '@/types/models/MessageReactionResouce';
import type { UserResource } from '@/types/models/UserResource';
import type { VideoCalls } from '@/types/models/VideoCalls';
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

