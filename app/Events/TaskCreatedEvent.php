<?php

namespace App\Events;

use App\Models\Task;
use Illuminate\Broadcasting\InteractsWithSockets;
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
        
        $users = [[
            'user_id' => $model->created_by,
        ]];
        if ($model->user_id) {
            $users[] = [
                'user_id' => $model->user_id,
            ];
        }

        $chat->users()->sync($users);

        //
    }

}
