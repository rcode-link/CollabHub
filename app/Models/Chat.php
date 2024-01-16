<?php

namespace App\Models;

use App\Events\ChatMessageCreated;
use App\Events\ChatUpdate;
use Database\Factories\ChatFactory;
use Eloquent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;

/**
 * App\Models\Chat
 *
 * @property int $id
 * @property string|null $title
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property string $chatable_type
 * @property int $chatable_id
 * @property-read ChatMessage|null $last_message
 * @property-read Collection<int, MessageReaction> $messageReactions
 * @property-read int|null $message_reactions_count
 * @property-read Collection<int, ChatMessage> $messages
 * @property-read int|null $messages_count
 * @property-read Collection<int, MessageReaction> $numberOfUnreadMessages
 * @property-read int|null $number_of_unread_messages_count
 * @property-read Collection<int, User> $users
 * @property-read int|null $users_count
 * @method static ChatFactory factory($count = null, $state = [])
 * @method static Builder|Chat newModelQuery()
 * @method static Builder|Chat newQuery()
 * @method static Builder|Chat query()
 * @method static Builder|Chat whereChatableId($value)
 * @method static Builder|Chat whereChatableType($value)
 * @method static Builder|Chat whereCreatedAt($value)
 * @method static Builder|Chat whereId($value)
 * @method static Builder|Chat whereTitle($value)
 * @method static Builder|Chat whereUpdatedAt($value)
 * @property-read Model|\Eloquent $chatable
 * @mixin Eloquent
 */
class Chat extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)->withTrashed();
    }

    public function chatable()
    {
        return $this->morphTo();
    }

    public function messages(): HasMany
    {
        return $this->hasMany(ChatMessage::class, 'chat_id')->orderByDesc('created_at');
    }

    public function sendMessage(array $message): void
    {
        $message = ChatMessage::create([
            'message' => $message,
            'chat_id' => $this->id,
            'user_id' => Auth::id(),
        ]);

        ChatUpdate::dispatch($this->users->toArray(), $message);
        ChatMessageCreated::dispatch($message);
    }

    public function messageReactions(): HasManyThrough
    {
        return $this->hasManyThrough(MessageReaction::class, ChatMessage::class);
    }
    public function numberOfUnreadMessages(): HasManyThrough
    {
        return $this->hasManyThrough(MessageReaction::class, ChatMessage::class)->whereNull('reaction')->where('message_reactions.user_id', Auth::id());
    }

    public function last_message(): HasOne
    {
        return $this->hasOne(ChatMessage::class, 'chat_id')->orderByDesc('created_at');
    }
}
