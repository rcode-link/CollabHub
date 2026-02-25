<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VacationGroupResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'days_per_year' => $this->days_per_year,
            'period_start' => $this->period_start->toDateString(),
            'period_end' => $this->period_end->toDateString(),
        ];
    }
}
