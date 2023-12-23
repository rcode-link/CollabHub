<?php

namespace App\Models;

use Database\Factories\SprintFactory;
use Eloquent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

/**
 * App\Models\Sprint
 *
 * @property int $id
 * @property string|null $title
 * @property string $start_time
 * @property string $end_time
 * @property int $is_active
 * @property int $board_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @method static SprintFactory factory($count = null, $state = [])
 * @method static Builder|Sprint newModelQuery()
 * @method static Builder|Sprint newQuery()
 * @method static Builder|Sprint query()
 * @method static Builder|Sprint whereBoardId($value)
 * @method static Builder|Sprint whereCreatedAt($value)
 * @method static Builder|Sprint whereEndTime($value)
 * @method static Builder|Sprint whereId($value)
 * @method static Builder|Sprint whereIsActive($value)
 * @method static Builder|Sprint whereStartTime($value)
 * @method static Builder|Sprint whereTitle($value)
 * @method static Builder|Sprint whereUpdatedAt($value)
 * @property int $duration
 * @method static Builder|Sprint whereDuration($value)
 * @property-read Collection<int, Task> $tasks
 * @property-read int|null $tasks_count
 * @property-read \App\Models\Board $board
 * @mixin Eloquent
 */
class Sprint extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'is_active' => 'boolean'
    ];

    public function activate(): void
    {
        Sprint::query()
            ->where('board_id', $this->board_id)
            ->whereNot('id', $this->id)
            ->update(['is_active' => false]);

        $this->update([
            'start_time' => now(),
            'end_time' => now()->addDays($this->duration),
            'is_active' => true
        ]);
    }

    public function board(): BelongsTo {
        return $this->belongsTo(Board::class);
    }

    public function tasks(): BelongsToMany
    {
        return $this->belongsToMany(Task::class, 'task_sprint')->using(TaskSprint::class);
    }
}
