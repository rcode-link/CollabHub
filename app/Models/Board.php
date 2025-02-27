<?php

namespace App\Models;

use Database\Factories\BoardFactory;
use Eloquent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Carbon;

/**
 * App\Models\Board
 *
 * @property int $id
 * @property string $title
 * @property string $type
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Collection<int, Sprint> $sprint
 * @property-read int|null $sprint_count
 * @method static BoardFactory factory($count = null, $state = [])
 * @method static Builder|Board newModelQuery()
 * @method static Builder|Board newQuery()
 * @method static Builder|Board query()
 * @method static Builder|Board whereCreatedAt($value)
 * @method static Builder|Board whereId($value)
 * @method static Builder|Board whereTitle($value)
 * @method static Builder|Board whereType($value)
 * @method static Builder|Board whereUpdatedAt($value)
 * @property int $project_id
 * @method static Builder|Board whereProjectId($value)
 * @mixin Eloquent
 */
class Board extends Model
{
    use HasFactory;
    use HasApiTokens;

    protected $guarded = [];

    public function sprint(): HasMany
    {
        return $this->hasMany(Sprint::class);
    }
}
