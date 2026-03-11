<?php

namespace App\Service;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Sends push notifications via a self-hosted ntfy server.
 * Each user gets a private topic: collabhub-user-{id}-{token}
 * where token is a hash to prevent topic enumeration.
 */
class NtfyService
{
    private string $baseUrl;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('services.ntfy.url', 'http://ntfy:80'), '/');
    }

    /**
     * Generate a private topic name for a user.
     */
    public static function topicForUser(int $userId): string
    {
        $secret = config('app.key');

        return 'collabhub-' . $userId . '-' . substr(hash('sha256', $userId . $secret), 0, 12);
    }

    /**
     * Send a notification to a user.
     */
    public function notify(int $userId, string $title, string $body, string $priority = 'default', array $extras = []): void
    {
        if (! config('services.ntfy.enabled', false)) {
            return;
        }

        $topic = self::topicForUser($userId);

        try {
            Http::timeout(5)
                ->withHeaders(array_filter([
                    'Title' => $title,
                    'Priority' => $priority,
                    'Tags' => $extras['tags'] ?? null,
                ]))
                ->withBody($body, 'text/plain')
                ->post("{$this->baseUrl}/{$topic}");
        } catch (\Throwable $e) {
            Log::warning('ntfy notification failed', [
                'user_id' => $userId,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send a message notification to a user.
     */
    public function notifyMessage(int $userId, string $senderName, string $text): void
    {
        $this->notify(
            $userId,
            "{$senderName} messaged you",
            $text ?: 'New message',
            'default',
            ['tags' => 'speech_balloon']
        );
    }

    /**
     * Send a video call notification to a user.
     */
    public function notifyVideoCall(int $userId, string $callerName): void
    {
        $this->notify(
            $userId,
            "{$callerName} is calling you",
            'Incoming video call',
            'high',
            ['tags' => 'phone']
        );
    }
}
