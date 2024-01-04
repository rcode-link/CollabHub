<?php

namespace App\Events;

use App\Http\Resources\TaskResource;
use App\Models\Task;
use Illuminate\Broadcasting\InteractsWithBroadcasting;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TaskUpdatedEvent implements ShouldBroadcast
{
    use InteractsWithBroadcasting;
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public TaskResource $task;

    /**
     * Create a new event instance.
     */
    public function __construct(private readonly Task $data, public int|null $oldStatus = 0)
    {
        $this->task = new TaskResource($this->data->load([
            'taskSprintData' => function (HasMany $builder) {
                $builder
                    ->with([
                        'status' => fn(HasOne $query) => $query->select('id', 'title', 'board_id'),
                        'status.board' => fn(BelongsTo $query) => $query->select('id', 'title'),
                        'sprint' => fn(HasOne $query) => $query->select('id', 'title')
                    ])
                    ->when(request()->has('sprint_id') && !request()->has('fullList'), function (Builder $builder) {
                        $builder->where('sprint_id', request()->get('sprint_id'));
                    });
            }]));
        //
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("task-updated." . $this->data->project_id),
            new PrivateChannel("task-updated.task." . $this->data->task_id),
        ];
    }
}
