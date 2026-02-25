<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property int $id
 * @property int $company_id
 * @property string $date
 * @property string $due_date
 * @property int $sent
 * @property string $note
 * @property int $total
 * @property int $discont
 * @property string $number
 * @property int $payments_sum_value
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
            'due_amount' => ($this->total - $this->payments_sum_value) / 100,
            'status' => $this->when($this->resource->relationLoaded('payments') || isset($this->payments_sum_value), function () {
                $paid = $this->payments_sum_value ?? 0;
                if (! $this->sent) {
                    return 'draft';
                }
                if ($paid >= $this->total && $this->total > 0) {
                    return 'paid';
                }
                if ($paid > 0) {
                    return 'partial';
                }
                if ($this->due_date && $this->due_date < now()->toDateString()) {
                    return 'overdue';
                }

                return 'sent';
            }),
            'vat_total' => $this->whenLoaded('items', function () {
                return round($this->items->sum(function ($item) {
                    $total = $item->total / 100;

                    return $total * ($item->vat_rate ?? 0) / 100;
                }), 2);
            }),
            'total_with_vat' => $this->whenLoaded('items', function () {
                $subtotal = $this->total / 100;
                $vatTotal = $this->items->sum(function ($item) {
                    $total = $item->total / 100;

                    return $total * ($item->vat_rate ?? 0) / 100;
                });

                return round($subtotal + $vatTotal, 2);
            }),
            'company' => $this->whenLoaded('company', fn () => new CustomerResource($this->company)),
            'items' => $this->whenLoaded('items', fn () => InvoiceItemResource::collection($this->items)),
        ];
    }
}
