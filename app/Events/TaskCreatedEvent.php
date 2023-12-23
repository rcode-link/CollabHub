<?php

namespace App\Events;

use App\Models\Permission;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TaskCreatedEvent
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(Task $model)
    {

        $chat = $model->chat()->create([
            'title' => $model->name
        ]);

        /*
         * Get all users that are able to open project where task is added and add them to chat
         */
        $users = Permission::query()
            ->select('user_id')
            ->where('resourceable_type', Project::class)
            ->where('resourceable_id', $model->project_id)
            ->where('permission', 'like', 'can-view-project.%')->get()->pluck('user_id');

        $chat->users()->sync($users->map(function ($str) {
            return [
                'user_id' => $str
            ];
        }));

        //
    }

}
