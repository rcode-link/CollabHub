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
        $sprint = Sprint::query()->with('board')->where('id', $request->get('sprint_id'))->firstOrFail();
        $task = Task::query()
            ->with('media', 'owner', 'createdBy', 'type', 'chat')
            ->where('id', $request->get('task_id'))->firstOrFail();

        $firstStatus = TaskStatuses::whereBoardId($sprint->board_id)->orderBy('order')->firstOrFail();

        // Remove task from all existing sprints (enforce single board relation)
        TaskSprint::whereTaskId($task->id)->delete();

        TaskSprint::query()->create([
            'task_id' => $task->id,
            'task_status_id' => $firstStatus->id,
            'sprint_id' => $request->get('sprint_id'),
        ]);

        // Post system comment about board assignment
        if ($task->chat) {
            $boardTitle = $sprint->board->title ?? 'Unknown Board';
            $sprintTitle = $sprint->title ?? 'Unknown Sprint';
            $task->chat->sendMessage([
                'type' => 'doc',
                'content' => [[
                    'type' => 'paragraph',
                    'content' => [[
                        'type' => 'text',
                        'text' => "Task moved to board \"{$boardTitle}\", sprint \"{$sprintTitle}\"",
                    ]],
                ]],
            ]);
        }

        TaskUpdatedEvent::dispatch($task, 0);
    }
}
