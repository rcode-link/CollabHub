<?php

namespace App\Models;

use Database\Factories\MessageReactionFactory;
use Eloquent;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;

/**
 * App\Models\MessageReaction
 *
 * @property int $id
 * @property string|null $reaction
 * @property int $user_id
 * @property int $chat_message_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @method static MessageReactionFactory factory($count = null, $state = [])
 * @method static Builder|MessageReaction newModelQuery()
 * @method static Builder|MessageReaction newQuery()
 * @method static Builder|MessageReaction query()
 * @method static Builder|MessageReaction reaction()
 * @method static Builder|MessageReaction seen()
 * @method static Builder|MessageReaction whereChatMessageId($value)
 * @method static Builder|MessageReaction whereCreatedAt($value)
 * @method static Builder|MessageReaction whereId($value)
 * @method static Builder|MessageReaction whereReaction($value)
 * @method static Builder|MessageReaction whereUpdatedAt($value)
 * @method static Builder|MessageReaction whereUserId($value)
 * @mixin Eloquent
 */
class MessageReaction extends Model
{
    use HasFactory;

    protected $guarded = [];
    public function scopeSeen(Builder $query): Builder|MessageReaction|\Illuminate\Database\Query\Builder
    {
        return $this->where('reaction', 'seen')->orWhereNull('reaction');
    }

    public function scopeReaction(Builder $query): Builder|MessageReaction
    {
        return $this->orWhere(function(Builder $data){
            $data->whereNot('reaction', 'seen')
                ->whereNotNull('reaction');
        });
    }


}
