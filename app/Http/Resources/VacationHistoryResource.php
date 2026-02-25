<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VacationHistoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $end = $this->freq_until ? Carbon::parse($this->freq_until) : Carbon::parse($this->start_time);
        $totalDays = max(1, (int) ceil(Carbon::parse($this->start_time)->diffInDays($end)));

        return [
            'id' => $this->id,
            'summary' => $this->summary,
            'start_time' => Carbon::parse($this->start_time),
            'end_time' => Carbon::parse($this->end_time),
            'freq_until' => $this->freq_until,
            'approved' => $this->approved,
            'total_days' => $totalDays,
            'vacation_group' => $this->whenLoaded('vacationGroup', fn () => new VacationGroupResource($this->vacationGroup)),
            'chat_id' => $this->whenLoaded('chat', fn () => $this->chat?->id),
        ];
    }
}
