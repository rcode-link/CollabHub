<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * App\Models\RoleResource
 *
 * @property int $id
 * @property int $role_id
 * @property string $resourcable_type
 * @property int $resourcable_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|RoleResource newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|RoleResource newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|RoleResource query()
 * @method static \Illuminate\Database\Eloquent\Builder|RoleResource whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|RoleResource whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|RoleResource whereResourcableId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|RoleResource whereResourcableType($value)
 * @method static \Illuminate\Database\Eloquent\Builder|RoleResource whereRoleId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|RoleResource whereUpdatedAt($value)
 * @property-read Model|\Eloquent $resourcable
 * @property-read \App\Models\Role|null $role
 * @mixin \Eloquent
 */
class RoleResource extends Model
{
    use HasFactory;

    protected $fillable = [
        'id',
        'role_id',
        'resourcable_type',
        'resourcable_id',
    ];

    public function resourcable(): MorphTo
    {
        return $this->morphTo();
    }

    public function role() {
        return $this->belongsTo(Role::class);
    }
}
