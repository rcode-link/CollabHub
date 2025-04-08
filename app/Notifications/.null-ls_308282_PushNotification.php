<?php

namespace App\Notifications;

use App\Models\ChatMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushChannel;
use NotificationChannels\WebPush\WebPushMessage;
use Tiptap\Editor;

class PushNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(private readonly ChatMessage $message)
    {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return [WebPushChannel::class];
    }

    public function toWebPush($notifiable, $notification)
    {
        $messageData = "New message";
        if ($this->message->message) {
            $messageData = (new Editor())->setContent($this->message->message)->getText();
        }
        return (new WebPushMessage)
            ->title('[new message]' . $this->message->user->name . ' sent you the message')
            ->body($messageData)
            ->data(['chat_id' => $this->message->id])
            ->icon(
                str_replace(
                    '//storage',
                    '/storage',
                    $this->message->user->getFirstMediaUrl('avatar')
                )
            )
            ->action('View App', 'notification_action');
    }
}
