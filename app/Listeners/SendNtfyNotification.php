<?php

namespace App\Listeners;

use App\Events\ChatUpdate;
use App\Events\StartVideoCall;
use App\Service\NtfyService;

class SendNtfyNotification
{
    public function __construct(private NtfyService $ntfy) {}

    public function handleChatUpdate(ChatUpdate $event): void
    {
        $senderName = $event->message['user'] ?? 'Someone';
        $senderId = $event->message['userId'] ?? null;
        $text = $event->message['text'] ?? '';

        // Members who muted this chat still get the websocket event (their
        // chat list must update) but no ntfy ping.
        $mutedIds = \DB::table('chat_user')
            ->where('chat_id', $event->chatId)
            ->where('muted_until', '>', now())
            ->pluck('user_id')
            ->all();

        // Extract user IDs from private channel names
        foreach ($event->broadcastOn() as $channel) {
            // PrivateChannel name format: "private-UpdateChatForUser.{userId}"
            $parts = explode('.', $channel->name);
            $userId = (int) end($parts);

            if ($userId && $userId !== $senderId && ! in_array($userId, $mutedIds)) {
                $this->ntfy->notifyMessage($userId, $senderName, $text);
            }
        }
    }

    public function handleVideoCall(StartVideoCall $event): void
    {
        $callerName = $event->callId['user']['name'] ?? 'Someone';

        foreach ($event->broadcastOn() as $channel) {
            // PrivateChannel name format: "private-start-call.{userId}"
            $parts = explode('.', $channel->name);
            $userId = (int) end($parts);

            if ($userId) {
                $this->ntfy->notifyVideoCall($userId, $callerName);
            }
        }
    }
}
