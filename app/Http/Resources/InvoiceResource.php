<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 *
 * @property int $id
 * @property int $company_id
 * @property string $date
 * @property string $due_date
 * @property int $sent
 * @property string $note
 * @property int $total
 * @property int $discont
 * @property string $number
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\InvoiceItem> $items

 * */
class InvoiceResource extends JsonResource
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
            'number' => $this->number,
            'company_id' => $this->company_id,
            'date' => $this->date,
            'due_date' => $this->due_date,
            'sent' => $this->sent,
            'note' => $this->note,
            'total' => $this->total / 100,
            'discont' => $this->discont,
            'company' => $this->whenLoaded('company', fn() => new CustomerResource($this->company)),
            'items' => $this->whenLoaded('items', fn() => InvoiceItemResource::collection($this->items))
        ];
    }
}
