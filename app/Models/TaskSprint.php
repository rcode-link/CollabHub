<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\Pivot;

/**
 * App\Models\TaskSprint
 *
 * @property int $id
 * @property int $task_id
 * @property int $sprint_id
 * @property int $task_status_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\TaskStatuses|null $status
 * @method static \Illuminate\Database\Eloquent\Builder|TaskSprint newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|TaskSprint newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|TaskSprint query()
 * @method static \Illuminate\Database\Eloquent\Builder|TaskSprint whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|TaskSprint whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|TaskSprint whereSprintId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|TaskSprint whereTaskId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|TaskSprint whereTaskStatusId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|TaskSprint whereUpdatedAt($value)
 * @property-read \App\Models\Sprint|null $sprint
 * @property-read \App\Models\Task|null $task
 * @mixin \Eloquent
 */
class TaskSprint extends Pivot
{

    public function status(): HasOne
    {
        return $this->hasOne(TaskStatuses::class, 'id', 'task_status_id');
    }

    public function sprint(): HasOne
    {
        return $this->hasOne(Sprint::class, 'id', 'sprint_id');
    }

    public function task(): HasOne
    {
        return $this->hasOne(Task::class, 'id', 'task_id');
    }
}
