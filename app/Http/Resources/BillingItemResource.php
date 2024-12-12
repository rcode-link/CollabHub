<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BillingItemResource extends JsonResource
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
            'name' => $this->title,
            'price' => $this->price / 100,
            'user' => $this->whenLoaded('users', function () {
                return [
                    'name' => $this->user->name,
                    'rate' => 0,
                ];
            }),
        ];
    }
}
