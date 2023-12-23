<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property int $id
 * @property string $summary
 * @property string $start_time
 * @property string $end_time
 * @property string $description
 * @property int $user_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property string|null $freq
 * @property string|null $freq_settings
 * @property string|null $freq_until
 */
class EventResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'summary' => $this->summary,
            'id' => $this->id,
            'start_time' => Carbon::parse($this->start_time),
            'end_time' => Carbon::parse($this->end_time),
            'freq' => $this->freq,
            'description' => $this->description,
            'freq_settings' => $this->freq_settings,
            'freq_until' => $this->freq_until,
            'attendance' => $this->whenLoaded('user', function () {
                return $this->user->map(fn($obj) => ['name' => $obj->name,'email' => $obj->email, 'id' => $obj->id, 'avatar' => $obj->getFirstMediaUrl('avatar'), 'attending' => $obj->pivot->attending]);
            })
        ];
    }
}
