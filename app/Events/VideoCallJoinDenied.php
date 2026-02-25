<?php

namespace App\Events;

use App\Models\VideoCallRequest;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithBroadcasting;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class VideoCallJoinDenied implements ShouldBroadcast
{
    use Dispatchable, InteractsWithBroadcasting, InteractsWithSockets, SerializesModels;

    public function __construct(public VideoCallRequest $request) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('video-call-request.'.$this->request->id),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->request->id,
            'status' => 'denied',
        ];
    }
}
