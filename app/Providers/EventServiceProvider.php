<?php

namespace App\Providers;

use App\Events\ChatUpdate;
use App\Events\StartVideoCall;
use App\Listeners\SendNtfyNotification;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Event;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        Registered::class => [
            SendEmailVerificationNotification::class,
        ],
    ];

    public function boot(): void
    {
        Event::listen(ChatUpdate::class, [SendNtfyNotification::class, 'handleChatUpdate']);
        Event::listen(StartVideoCall::class, [SendNtfyNotification::class, 'handleVideoCall']);
    }

    /**
     * Determine if events and listeners should be automatically discovered.
     */
    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}
