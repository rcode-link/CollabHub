<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \Laravel\Passkeys\Passkey
 */
class PasskeyResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'authenticator' => $this->authenticator,
            'last_used_at' => $this->last_used_at,
            'created_at' => $this->created_at,
        ];
    }
}
