<?php

namespace App\Models;

use Eloquent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * App\Models\PermissionDefinition
 *
 * @property int $id
 * @property string $scope
 * @property string $name
 * @property string $slug
 * @property int $group_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @method static Builder|PermissionDefinition newModelQuery()
 * @method static Builder|PermissionDefinition newQuery()
 * @method static Builder|PermissionDefinition query()
 * @method static Builder|PermissionDefinition whereCreatedAt($value)
 * @method static Builder|PermissionDefinition whereGroupId($value)
 * @method static Builder|PermissionDefinition whereId($value)
 * @method static Builder|PermissionDefinition whereName($value)
 * @method static Builder|PermissionDefinition whereScope($value)
 * @method static Builder|PermissionDefinition whereSlug($value)
 * @method static Builder|PermissionDefinition whereUpdatedAt($value)
 * @mixin Eloquent
 */
class PermissionDefinition extends Model
{
    use HasFactory;
}
