<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * App\Models\TimeSheet
 *
 * @property int $id
 * @property int $user_id
 * @property int $task_id
 * @property string $start
 * @property string $end
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Database\Factories\TimeSheetFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder|TimeSheet newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|TimeSheet newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|TimeSheet query()
 * @method static \Illuminate\Database\Eloquent\Builder|TimeSheet whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|TimeSheet whereEnd($value)
 * @method static \Illuminate\Database\Eloquent\Builder|TimeSheet whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|TimeSheet whereStart($value)
 * @method static \Illuminate\Database\Eloquent\Builder|TimeSheet whereTaskId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|TimeSheet whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|TimeSheet whereUserId($value)
 * @property-read \App\Models\User|null $user
 * @mixin \Eloquent
 */
class TimeSheet extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'start' => 'datetime',
        'end' => 'datetime'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }
}
