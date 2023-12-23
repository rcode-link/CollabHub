<?php

namespace App\Models;

use Database\Factories\TaskRelationFactory;
use Eloquent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * App\Models\TaskRelation
 *
 * @property int $id
 * @property string $name
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @method static TaskRelationFactory factory($count = null, $state = [])
 * @method static Builder|TaskRelation newModelQuery()
 * @method static Builder|TaskRelation newQuery()
 * @method static Builder|TaskRelation query()
 * @method static Builder|TaskRelation whereCreatedAt($value)
 * @method static Builder|TaskRelation whereId($value)
 * @method static Builder|TaskRelation whereName($value)
 * @method static Builder|TaskRelation whereUpdatedAt($value)
 * @property int $can_parent_be_closed
 * @method static Builder|TaskRelation whereCanParentBeClosed($value)
 * @mixin Eloquent
 */
class TaskRelation extends Model
{
    use HasFactory;

    protected $guarded = [];
}
