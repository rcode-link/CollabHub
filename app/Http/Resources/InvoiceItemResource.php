<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property int $id
 * @property int $price
 * @property int $qty
 * @property int $total
 * @property int $billing_item_id
 * @property-read \App\Models\BillingItem $billingItem
 */
class InvoiceItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $total = $this->total / 100;
        $vatRate = (float) ($this->vat_rate ?? 0);
        $vatAmount = $total * $vatRate / 100;

        return [
            'id' => $this->id,
            'name' => $this->whenLoaded('billingItem', $this->billingItem->title),
            'qty' => $this->qty / 100,
            'total' => $total,
            'price' => $this->price / 100,
            'vat_rate' => $vatRate,
            'vat_amount' => round($vatAmount, 2),
            'total_with_vat' => round($total + $vatAmount, 2),
            'billing_item' => $this->whenLoaded('billingItem', fn () => [
                'unit' => $this->billingItem->unit ?? null,
            ]),
        ];
    }
}
