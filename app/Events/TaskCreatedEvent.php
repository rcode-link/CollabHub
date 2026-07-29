<?php

namespace App\Events;

use App\Models\Task;
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;

class TaskCreatedEvent
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(Task $model)
    {

        $chat = $model->chat()->create([
            'title' => $model->name,
        ]);

        /*
         * Chat members are the task's notification audience: the creator, the
         * assignee, and every user who opted into auto-subscribing to new
         * tasks (limited to users allowed to view the project).
         */

        $userIds = collect([$model->created_by, $model->user_id])
            ->merge($this->autoSubscriberIds($model))
            ->filter()
            ->unique();

        $chat->users()->sync($userIds->all());
    }

    /**
     * Users who enabled "subscribe to all tasks" and can view the project.
     */
    private function autoSubscriberIds(Task $model): \Illuminate\Support\Collection
    {
        $permissions = Cache::get('permissions', collect([]));
        if (! $permissions || ! $permissions->count()) {
            ManagePermissionsEvent::dispatch();
            $permissions = Cache::get('permissions', collect([]));
        }

        $allowedUserIds = $permissions
            ->filter(fn ($entry) => $entry['permissions']->contains('can-view-project.'.$model->project_id))
            ->flatMap(fn ($entry) => $entry['users'])
            ->unique();

        if ($allowedUserIds->isEmpty()) {
            return collect([]);
        }

        return User::query()
            ->where('subscribe_to_all_tasks', true)
            ->whereIn('id', $allowedUserIds)
            ->pluck('id');
    }
}
