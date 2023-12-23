<?php

namespace App\Events;

use App\Models\Board;
use App\Models\Sprint;
use App\Models\TaskStatuses;
use Illuminate\Foundation\Events\Dispatchable;

class BoardCreatedEvent
{
    use Dispatchable;

    /**
     * Create a new event instance.
     */
    public function __construct(Board $board)
    {
        if ($board->type === 'kanban') {
            Sprint::create([
                'title' => $board->name,
                'is_active' => true,
                'board_id' => $board->id,
                'duration' => 6000
            ]);
        }

        $statuses = TaskStatuses::query()
            ->whereProjectId($board->project_id)
            ->whereNull('board_id')
            ->get()
            ->map(function ($obj) use ($board) {
                $obj->project_id = $board->project_id;
                $obj->board_id = $board->id;
                $obj->id = null;
                return $obj;
            });
        TaskStatuses::insert($statuses->toArray());
        //
    }

}
