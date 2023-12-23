<?php

namespace App\Models;

use Eloquent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Collections\MediaCollection;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * App\Models\ChatMessage
 *
 * @property int $id
 * @property int $user_id
 * @property int $chat_id
 * @property array|null $message
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property int|null $parent_id
 * @property-read MediaCollection<int, Media> $media
 * @property-read int|null $media_count
 * @property-read Collection<int, MessageReaction> $messageReactions
 * @property-read int|null $message_reactions_count
 * @property-read Collection<int, MessageReaction> $newMessages
 * @property-read int|null $new_messages_count
 * @property-read ChatMessage|null $parent
 * @property-read User|null $user
 * @property-read VideoCalls|null $videocalls
 * @method static Builder|ChatMessage newModelQuery()
 * @method static Builder|ChatMessage newQuery()
 * @method static Builder|ChatMessage query()
 * @method static Builder|ChatMessage relations()
 * @method static Builder|ChatMessage whereChatId($value)
 * @method static Builder|ChatMessage whereCreatedAt($value)
 * @method static Builder|ChatMessage whereId($value)
 * @method static Builder|ChatMessage whereMessage($value)
 * @method static Builder|ChatMessage whereParentId($value)
 * @method static Builder|ChatMessage whereUpdatedAt($value)
 * @method static Builder|ChatMessage whereUserId($value)
 * @mixin Eloquent
 */
class ChatMessage extends Model implements HasMedia
{
    use InteractsWithMedia;

    protected $guarded = [];

    protected $casts = [
        'message' => 'json'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeRelations(): Builder
    {
        return $this->with('user', 'media', 'videocalls', 'parent', 'messageReactions');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(ChatMessage::class, 'parent_id');
    }

    public function videocalls(): HasOne
    {
        return $this->hasOne(VideoCalls::class);
    }


    public function messageReactions(): HasMany
    {
        return $this->hasMany(MessageReaction::class)->orWhere(function (Builder $data) {
            $data->whereNot('reaction', 'seen')
                ->whereNotNull('reaction');
        });
    }

    public function newMessages(): HasMany
    {
        return $this->hasMany(MessageReaction::class)->whereNull('reaction')->where('user_id', Auth::id());
    }


    public function messageViews(): Builder
    {
        return $this->hasMany(MessageReaction::class)->seen()->where('user_id', Auth::id());
    }


}
