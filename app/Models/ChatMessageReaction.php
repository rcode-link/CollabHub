<?php

namespace App\Models;

use Database\Factories\ChatMessageReactionFactory;
use Eloquent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * App\Models\ChatMessageReaction
 *
 * @property int $id
 * @property int $chat_message_id
 * @property int $user_id
 * @property string $type
 * @property string|null $content
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @method static ChatMessageReactionFactory factory($count = null, $state = [])
 * @method static Builder|ChatMessageReaction newModelQuery()
 * @method static Builder|ChatMessageReaction newQuery()
 * @method static Builder|ChatMessageReaction query()
 * @method static Builder|ChatMessageReaction whereChatMessageId($value)
 * @method static Builder|ChatMessageReaction whereContent($value)
 * @method static Builder|ChatMessageReaction whereCreatedAt($value)
 * @method static Builder|ChatMessageReaction whereId($value)
 * @method static Builder|ChatMessageReaction whereType($value)
 * @method static Builder|ChatMessageReaction whereUpdatedAt($value)
 * @method static Builder|ChatMessageReaction whereUserId($value)
 * @mixin Eloquent
 */
class ChatMessageReaction extends Model
{
    use HasFactory;
}
