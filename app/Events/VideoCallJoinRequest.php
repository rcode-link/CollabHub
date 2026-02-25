<?php

namespace App\Events;

use App\Models\VideoCallRequest;
use Illuminate\Broadcasting\InteractsWithBroadcasting;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class VideoCallJoinRequest implements ShouldBroadcast
{
    use Dispatchable, InteractsWithBroadcasting, InteractsWithSockets, SerializesModels;

    public function __construct(public string $slug, public VideoCallRequest $request) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('video-call.'.$this->slug),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->request->id,
            'name' => $this->request->name,
            'user_id' => $this->request->user_id,
            'status' => $this->request->status,
        ];
    }
}
