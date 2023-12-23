<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ChatMessageResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'message' => $this->message,
            'createdAt' => $this->created_at,
            'isEdited' => $this->created_at != $this->updated_at,
            'media' => $this->whenLoaded('media', MediaResource::collection($this->media)),
            'user' => $this->whenLoaded('user', new UserResource($this->user)),
            'videocall' => $this->whenLoaded('user', $this->videocalls),
            'parent_id' => $this->parent_id,
            'reactions' => $this->whenLoaded('messageReactions', MessageReactionResouce::collection($this->messageReactions)),
            'parent' => $this->whenLoaded('parent', function () {
                return [
                    'text' => $this->parent->message,
                    'id' => $this->parent->id
                ];
            }),
        ];
    }
}
