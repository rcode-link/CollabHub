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

        // Extract user IDs from private channel names
        foreach ($event->broadcastOn() as $channel) {
            // PrivateChannel name format: "private-UpdateChatForUser.{userId}"
            $parts = explode('.', $channel->name);
            $userId = (int) end($parts);

            if ($userId && $userId !== $senderId) {
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
