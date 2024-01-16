<?php

namespace App\Events;

use App\Helpers\Enums\EventTypes;
use App\Models\ChatMessage;
use App\Models\Event;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Auth;

class HandleVacationRequestEvent
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(Event $event)
    {
        if ($event->type === EventTypes::Event->value) {
            return;
        }

        $manager = Auth::user()->manager()->first();

        if (!$manager) {
            $event->update([
                'approved' => true
            ]);
            return;
        }

        $chatUsers = [Auth::id()];
        do {
            $chatUsers[] = $manager->id;
            $manager = $manager->manager()->first();
        }while ($manager && !$manager->permissions()->pluck('permissions')->flatten()->contains(fn($obj)=> str_starts_with($obj, 'can-approve-vacation.')));

        $chat = $event->chat()->create([
            'title' => Auth::user()->name . ' vacation request'
        ]);

        $chat->users()->sync($chatUsers);

        $messageContent = [
            "type" => "doc",
            "content" => [
                [
                    "type" => "vacation",
                    "attrs" => [
                        "eventId" => $event->id
                    ]
                ]
            ]
        ];
        $message = ChatMessage::create([
            'message' => $messageContent,
            'user_id' => Auth::id(),
            'chat_id' => $chat->id
        ]);
        $message->load('user', 'media', 'videocalls', 'parent', 'messageReactions');
        $message->messageViews()->insert($chat->users->pluck('id')->map(function ($user_id) use ($message) {
            return [
                'user_id' => $user_id,
                'chat_message_id' => $message->id,
                'reaction' => null
            ];
        })->toArray());
        ChatUpdate::dispatch($chat->users->toArray(), $message);
        ChatMessageCreated::dispatch($message);
    }
}
