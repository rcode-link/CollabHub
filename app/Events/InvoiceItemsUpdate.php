<?php

namespace App\Events;

use App\Http\Resources\InvoiceResource;
use App\Models\Invoice;
use Illuminate\Broadcasting\InteractsWithBroadcasting;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class InvoiceItemsUpdate implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;
    use InteractsWithBroadcasting;

    public InvoiceResource $items;

    /**
     * Create a new event instance.
     */
    public function __construct(public int $invoice_id)
    {
        $data = Invoice::whereId($invoice_id)->with('items', 'items.billingItem', 'company', 'company.currency')->firstOrFail();
        $this->items = new InvoiceResource($data);
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('update-invoice.'.$this->invoice_id),
        ];
    }
}
