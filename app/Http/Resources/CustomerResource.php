<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property int $id
 * @property string $name
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read MediaCollection<int, Media> $media
 * @property-read int|null $media_count
 * @property-read Collection<int, User> $users
 * @property string|null $address
 * @property string|null $city
 * @property string|null $zip
 * @property string|null $country
 * @property string|null $billing_address
 * @property string|null $billing_city
 * @property string|null $billing_zip
 * @property string|null $billing_country
 * @property-read \App\Models\Invoice|null $invoices
 * @property-read \App\Models\Payment|null $payments
 */
class CustomerResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return
            [
                'id' => $this->id,
                'name' => $this->name,
                'logo' => $this->getFirstMediaUrl('avatar'),
                ...$this->when(!request()->routeIs('apicustomers.index'), [
                    'created_at' => $this->created_at,
                    'updated_at' => $this->updated_at,
                    'address' => $this->address,
                    'city' => $this->city,
                    'zip' => $this->zip,
                    'country' => $this->country,
                    'billing_address' => $this->billing_address,
                    'billing_city' => $this->billing_city,
                    'billing_zip' => $this->billing_zip,
                    'billing_country' => $this->billing_country,
                    'invoices' => $this->whenLoaded('invoices', fn() => InvoiceResource::collection($this->invoices)) ?? [],
                    'payments' => $this->whenLoaded('payments', fn() => InvoiceResource::collection($this->payments)) ?? []
                ], [])
            ];
    }
}
