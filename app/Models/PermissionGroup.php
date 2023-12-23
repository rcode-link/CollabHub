<?php

namespace App\Models;

use Eloquent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * App\Models\PermissionGroup
 *
 * @property int $id
 * @property string $name
 * @property int|null $parent_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @method static Builder|PermissionGroup newModelQuery()
 * @method static Builder|PermissionGroup newQuery()
 * @method static Builder|PermissionGroup query()
 * @method static Builder|PermissionGroup whereCreatedAt($value)
 * @method static Builder|PermissionGroup whereId($value)
 * @method static Builder|PermissionGroup whereName($value)
 * @method static Builder|PermissionGroup whereParentId($value)
 * @method static Builder|PermissionGroup whereUpdatedAt($value)
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\PermissionDefinition> $definition
 * @property-read int|null $definition_count
 * @mixin Eloquent
 */
class PermissionGroup extends Model
{

    protected $fillable = [
        'name',
        'parent_id'
    ];

    public function definition(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(PermissionDefinition::class, 'group_id');
    }
}
