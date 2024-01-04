<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $title
 * @property int $open
 * @property int|null $project_id
 * @property int $order
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class TaskStatusResource extends JsonResource
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
            'title' => $this->title,
            'open' => $this->open === 1,
            'order' => $this->order
        ];
    }
}
