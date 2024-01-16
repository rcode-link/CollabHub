<?php

namespace App\Models;

use Agence104\LiveKit\RoomServiceClient;
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
 * @property string $callable_type
 * @property int $callable_id
 * @property int $is_active
 * @property-read Model|\Eloquent $callable
 * @method static Builder|VideoCalls whereCallableId($value)
 * @method static Builder|VideoCalls whereCallableType($value)
 * @method static Builder|VideoCalls whereIsActive($value)
 * @mixin Eloquent
 */
class VideoCalls extends Model
{

    protected $guarded = [];

    protected $daysOfWeek = [
        'MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

    protected $casts = [
        'users' => 'array'
    ];

    public function callable(): \Illuminate\Database\Eloquent\Relations\MorphTo
    {
        return $this->morphTo();
    }

    /**
     * @throws \Exception
     */
    public function canIJoinVideoCall($currentTime, $user): bool
    {
        $current = Carbon::parse($currentTime)->setTimezone("UTC");

        $data = (new RoomServiceClient(host: config('livekit.url'), apiKey: config('livekit.key'), apiSecret: config('livekit.secret')));

        $listOfUsers = $data->listParticipants($this->slug);

        // if video call has users in it then user can join
        if ($listOfUsers->getParticipants()->count() > 0) {
            return true;
        }

        switch ($this->callable::class) {
            case Event::class:
                $startDate = Carbon::parse($currentTime)->setTimezone("UTC")->hour($this->callable->start_time->hour)->minute($this->callable->start_time->minute)->add('minute', -15);
                $endDate = Carbon::parse($currentTime)->setTimezone("UTC")->hour($this->callable->end_time->hour)->minute($this->callable->end_time->minute);
                if ($this->callable->freq_until && $this->callable->freq_until < now()) {
                    return false;
                }
                $isAfterStartTime = $startDate < $current;
                $isBellowEndTime = $endDate > $current;

                if (!$isAfterStartTime || !$isBellowEndTime) {
                    return false;
                }
                $currentDay = $this->daysOfWeek[now()->dayOfWeek - 1];
                $isDay = str_contains($this->callable->freq_settings, $currentDay);
                if ($this->callable->freq === 'WEEKLY' && !$isDay) {
                    return false;
                }
                break;
            case ChatMessage::class:
                $diff = $this->created_at->add('minutes', 5)->isAfter(now());
                if (!$diff) {
                    return false;
                }

                if ($listOfUsers->getParticipants()->count() === 0 && $this->callable->user_id !== $user['id']) {
                    return false;
                }

                break;
        }

        return true;
    }
}
