<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReportResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'title' => $this->task->name,
            'task_id' => $this->task->id,
            'user' => [
                'id' => $this->user_id,
                'name' => $this->user->name
            ],
            'start_time' => $this->start,
            'end_time' => $this->end
        ];
    }
}
