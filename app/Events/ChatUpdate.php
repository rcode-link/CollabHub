<?php

namespace App\Events;

use App\Http\Resources\ChatMessageResource;
use App\Models\Chat;
use App\Models\ChatMessage;
use Illuminate\Broadcasting\InteractsWithBroadcasting;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Ramsey\Collection\Collection;
use Tiptap\Editor;

class ChatUpdate implements ShouldBroadcast
{
    use InteractsWithBroadcasting;
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;
    public $chatId;

    /**
     * Create a new event instance.
     */
    public function __construct(private readonly array $users, ?ChatMessage $message)
    {
        $this->chatId = $message->chat_id;
        $this->message = [
            'text' =>  (new Editor())->setContent($message?->message ?? ['content' => ''])->getText([
                'blockSeparator' => "\n",
            ]),
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
