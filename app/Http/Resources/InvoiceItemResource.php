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
        return [
            'id' => $this->id,
            'name' => $this->whenLoaded('billingItem', $this->billingItem->title),
            'qty' => $this->qty / 100,
            'total' => $this->total / 100,
            'price' => $this->price / 100,
        ];
    }
}
