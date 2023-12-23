<?php

namespace App\Models;

use Database\Factories\PermissionFactory;
use Eloquent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Carbon;

/**
 * App\Models\Permission
 *
 * @property int $id
 * @property int $user_id
 * @property string $resourceable_type
 * @property int $resourceable_id
 * @property string $permission
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Model|Eloquent $resourceable
 * @method static PermissionFactory factory($count = null, $state = [])
 * @method static Builder|Permission newModelQuery()
 * @method static Builder|Permission newQuery()
 * @method static Builder|Permission query()
 * @method static Builder|Permission whereCreatedAt($value)
 * @method static Builder|Permission whereId($value)
 * @method static Builder|Permission wherePermission($value)
 * @method static Builder|Permission whereResourceableId($value)
 * @method static Builder|Permission whereResourceableType($value)
 * @method static Builder|Permission whereUpdatedAt($value)
 * @method static Builder|Permission whereUserId($value)
 * @mixin Eloquent
 */
class Permission extends Model
{
    use HasFactory;

    protected $guarded = [];


    public function resourceable(): MorphTo
    {
        return $this->morphTo();
    }
}
