<?php

namespace App\Events;

use App\Models\Board;
use App\Models\Sprint;
use App\Models\Task;
use App\Models\TaskSprint;
use App\Models\TaskStatuses;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Http\Request;

class AddTaskToSprintEvent
{
    use Dispatchable;

    /**
     * Create a new event instance.
     */
    public function __construct(Request $request)
    {
        $sprint = Sprint::query()->where('id', $request->get('sprint_id'))->firstOrFail();
        $task = Task::query()
            ->with('media', 'owner', 'createdBy', 'type', 'chat')
            ->where('id', $request->get('task_id'))->firstOrFail();

        $status_id = TaskStatuses::whereBoardId($sprint->board_id)->orderBy('order')->firstOrFail();
        TaskSprint::query()->create([
            'task_id' => $task->id,
            'task_status_id' => $status_id->id,
            'sprint_id' => $request->get('sprint_id')
        ]);
        TaskUpdatedEvent::dispatch($task, 0);
    }

}
