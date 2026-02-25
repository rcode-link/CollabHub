<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TimeTrackingReportResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $start = $this->start;
        $end = $this->end;
        $durationMinutes = $start && $end ? $start->diffInMinutes($end) : 0;

        return [
            'id' => $this->id,
            'date' => $start?->toDateString(),
            'user' => [
                'id' => $this->user_id,
                'name' => $this->user?->name,
            ],
            'project' => [
                'id' => $this->task?->project_id,
                'name' => $this->task?->project?->name,
            ],
            'task' => [
                'id' => $this->task_id,
                'name' => $this->task?->name,
            ],
            'start' => $start?->format('H:i'),
            'end' => $end?->format('H:i'),
            'duration_minutes' => $durationMinutes,
        ];
    }
}
