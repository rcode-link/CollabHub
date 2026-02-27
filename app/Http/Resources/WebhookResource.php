<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WebhookResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'token' => $this->token,
            'url' => url("/api/v1/webhooks/ingest/{$this->token}"),
            'is_active' => $this->is_active,
            'created_at' => $this->created_at,
            'created_by' => $this->created_by,
            'chat' => $this->whenLoaded('chat', fn () => new ChatResource($this->chat)),
        ];
    }
}
