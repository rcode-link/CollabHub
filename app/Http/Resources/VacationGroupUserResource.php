<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VacationGroupUserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'avatar' => mediaUrl($this->getFirstMedia('avatar')),
            'days_allocated' => $this->pivot->days_allocated,
        ];
    }
}
