<?php

namespace App\Models;

use Database\Factories\TaskStatusesFactory;
use Eloquent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * App\Models\TaskStatuses
 *
 * @property int $id
 * @property string $title
 * @property int $open
 * @property int|null $project_id
 * @property int $order
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @method static TaskStatusesFactory factory($count = null, $state = [])
 * @method static Builder|TaskStatuses newModelQuery()
 * @method static Builder|TaskStatuses newQuery()
 * @method static Builder|TaskStatuses query()
 * @method static Builder|TaskStatuses whereCreatedAt($value)
 * @method static Builder|TaskStatuses whereId($value)
 * @method static Builder|TaskStatuses whereOpen($value)
 * @method static Builder|TaskStatuses whereOrder($value)
 * @method static Builder|TaskStatuses whereProjectId($value)
 * @method static Builder|TaskStatuses whereTitle($value)
 * @method static Builder|TaskStatuses whereUpdatedAt($value)
 * @property int|null $sprint_id
 * @method static Builder|TaskStatuses whereSprintId($value)
 * @property int|null $board_id
 * @method static Builder|TaskStatuses whereBoardId($value)
 * @property-read \App\Models\Board|null $board
 * @mixin Eloquent
 */
class TaskStatuses extends Model
{
    use HasFactory;
    protected $fillable = [
        'order',
        'id',
        'title',
        'open',
        'project_id',
        'board_id',
        'sprint_id',
    ];

    public function board(): BelongsTo
    {
        return $this->belongsTo(Board::class);
    }

    public function updateOrder($order): bool
    {
        TaskStatuses::query()
            ->where('project_id', $this->project_id)
            ->where('board_id', $this->board_id)
            ->where('order', $order)
            ->update([
                'order' => $this->order
            ]);
        $this->update([
            'order' => $order
        ]);
        return true;
    }
}
