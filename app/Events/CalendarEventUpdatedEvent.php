<?php

namespace App\Events;

use App\Models\Event as EventModel;
use Illuminate\Broadcasting\InteractsWithBroadcasting;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CalendarEventUpdatedEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;
    use InteractsWithBroadcasting;

    /**
     * Create a new event instance.
     */
    public function __construct(private EventModel $eventModel)
    {
        //
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        $chanels = [];

        foreach ($this->eventModel->user as $value) {
            $chanels[] = new PrivateChannel('event.'.$value->id);
        }
        $chanels[] = new PrivateChannel('event.'.$this->eventModel->user_id);

        return $chanels;
    }
}
