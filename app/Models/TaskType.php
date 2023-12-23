<?php

namespace App\Models;

use Database\Factories\TaskTypeFactory;
use Eloquent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * App\Models\TaskType
 *
 * @property int $id
 * @property string $title
 * @property string|null $colour
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @method static TaskTypeFactory factory($count = null, $state = [])
 * @method static Builder|TaskType newModelQuery()
 * @method static Builder|TaskType newQuery()
 * @method static Builder|TaskType query()
 * @method static Builder|TaskType whereColour($value)
 * @method static Builder|TaskType whereCreatedAt($value)
 * @method static Builder|TaskType whereId($value)
 * @method static Builder|TaskType whereTitle($value)
 * @method static Builder|TaskType whereUpdatedAt($value)
 * @mixin Eloquent
 */
class TaskType extends Model
{
    use HasFactory;

    protected $guarded = [];
}
