<?php

namespace App\Models;

use Database\Factories\NotificationsFactory;
use Eloquent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * App\Models\Notifications
 *
 * @property int $id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @method static NotificationsFactory factory($count = null, $state = [])
 * @method static Builder|Notifications newModelQuery()
 * @method static Builder|Notifications newQuery()
 * @method static Builder|Notifications query()
 * @method static Builder|Notifications whereCreatedAt($value)
 * @method static Builder|Notifications whereId($value)
 * @method static Builder|Notifications whereUpdatedAt($value)
 * @mixin Eloquent
 */
class Notifications extends Model
{
    use HasFactory;
}
