<?php

namespace App\Events;

use App\Models\ChatMessage;
use Illuminate\Broadcasting\InteractsWithBroadcasting;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Tiptap\Editor;

class ChatUpdate implements ShouldBroadcast
{
    use InteractsWithBroadcasting;
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public $message;
    public $chatId;

    /**
     * Create a new event instance.
     */
    public function __construct(private readonly array $users, ?ChatMessage $message)
    {
        $this->chatId = $message->chat_id;
        $messageData = 'media';
        if ($message->message) {
            $messageData = (new Editor())->setContent($message->message)->getText();
        }
        $this->message = [
            'text' => $messageData,
            'created_at' => $message?->created_at,
            'user' => $message?->user?->name
        ];
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        $listOfChannels = [];
        foreach ($this->users as $obj) {
            $listOfChannels[] = new PrivateChannel('UpdateChatForUser.' . $obj['id']);
        }
        return $listOfChannels;
    }
}
