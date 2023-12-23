<?php

namespace App\Models;

use Eloquent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * App\Models\VideoCalls
 *
 * @property int $id
 * @property string $title
 * @property array $users
 * @property int $chat_message_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @method static Builder|VideoCalls newModelQuery()
 * @method static Builder|VideoCalls newQuery()
 * @method static Builder|VideoCalls query()
 * @method static Builder|VideoCalls whereChatMessageId($value)
 * @method static Builder|VideoCalls whereCreatedAt($value)
 * @method static Builder|VideoCalls whereId($value)
 * @method static Builder|VideoCalls whereTitle($value)
 * @method static Builder|VideoCalls whereUpdatedAt($value)
 * @method static Builder|VideoCalls whereUsers($value)
 * @property string|null $slug
 * @method static Builder|VideoCalls whereSlug($value)
 * @mixin Eloquent
 */
class VideoCalls extends Model
{

    protected $guarded = [];

    protected $casts = [
        'users' => 'array'
    ];
}
