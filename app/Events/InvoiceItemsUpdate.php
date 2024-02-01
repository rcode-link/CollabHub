<?php

namespace App\Events;

use App\Http\Resources\InvoiceItemResource;
use App\Http\Resources\InvoiceResource;
use App\Models\Invoice;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithBroadcasting;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Queue\SerializesModels;

class InvoiceItemsUpdate implements ShouldBroadcast
{
    use InteractsWithBroadcasting;
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public InvoiceResource $items;
    /**
     * Create a new event instance.
     */
    public function __construct(public int $invoice_id)
    {
        $data = Invoice::whereId($invoice_id)->with('items', 'items.billingItem', 'company')->firstOrFail();
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
            new PrivateChannel('update-invoice.' . $this->invoice_id),
        ];
    }
}
