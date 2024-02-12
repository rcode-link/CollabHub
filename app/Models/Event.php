<?php

namespace App\Models;

use App\Events\CalendarEventUpdatedEvent;
use App\Helpers\HasChat;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use App\Helpers\DateTime;

/**
 * App\Models\Event
 *
 * @property int $id
 * @property string $summary
 * @property string $start_time
 * @property string $end_time
 * @property string $description
 * @property int $user_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|Event newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Event newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Event query()
 * @method static \Illuminate\Database\Eloquent\Builder|Event whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Event whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Event whereEndTime($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Event whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Event whereStartTime($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Event whereSummary($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Event whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Event whereUserId($value)
 * @property string|null $freq
 * @property string|null $freq_settings
 * @property string|null $freq_until
 * @property-read \App\Models\User|null $user
 * @method static \Illuminate\Database\Eloquent\Builder|Event whereFreq($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Event whereFreqSettings($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Event whereFreqUntil($value)
 * @property-read \App\Models\User|null $creator
 * @property-read int|null $user_count
 * @property-read \App\Models\VideoCalls|null $videocalls
 * @property int $approved
 * @property string $type
 * @method static Builder|Event whereApproved($value)
 * @method static Builder|Event whereType($value)
 * @property-read \App\Models\Chat|null $chat
 * @mixin \Eloquent
 */
class Event extends Model
{
    use HasFactory;
    use HasChat;

    protected $fillable = [
        'summary',
        'start_time',
        'end_time',
        'id',
        'description',
        'user_id',
        'freq',
        'freq_settings',
        'freq_until',
        'approved',
        'type',
    ];

    protected $casts = [
        'end_time' => 'datetime',
        'start_time' => 'datetime'
    ];

    protected static function booted()
    {
        parent::booted();

        self::updated(fn(Event $event) => CalendarEventUpdatedEvent::broadcast($event->load('user', 'creator')));
        self::created(fn(Event $event) => CalendarEventUpdatedEvent::broadcast($event->load('user', 'creator')));
    }

    public function creator(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function videocalls(): \Illuminate\Database\Eloquent\Relations\MorphOne
    {
        return $this->morphOne(VideoCalls::class, 'callable');
    }

    public static function convertToICalendarFormat(): string
    {

        $events = Event::query()
            ->with(['creator', 'user', 'videocalls'])
            ->where(function (Builder $query) {
                $query->where('user_id', \Auth::id())
                    ->orWhereHas('user', fn(Builder $builder) => $builder->where('user_id', \Auth::id())->where('attending', true));
            })->get();

        $tasks = Task::query()
            ->where('user_id', Auth::id())
            ->with('type', 'owner', 'project')
            ->whereNotNull('due_date')
            ->whereHas('taskSprintData', function (Builder $builder) {
                $builder->whereHas('status', fn(Builder $query) => $query->where('open', true));
            })->get();
        $icalendar = "BEGIN:VCALENDAR\r\n";
        $alarm = "BEGIN:VALARM\r\nTRIGGER:-PT15M\r\nDESCRIPTION:Reminder\r\nACTION:DISPLAY\r\nEND:VALARM\r\n";

        foreach ($events as $event) {
            $videoCallLink = '';
            if ($event->videocalls) {
                $videoCallLink = '<a href="' . config('app.url') . '/call/' . $event->videocalls->slug . '">Start call</a>';
            }
            $icalendar .= "BEGIN:VEVENT\r\n";
            $icalendar .= "UID:" . \Str::slug(config('app.url') . ' ' . Event::class) . $event->id . "\r\n";
            ;
            $icalendar .= "SUMMARY:" . $event['summary'] . "\r\n";
            $icalendar .= "DESCRIPTION:" . str_replace("\n", "\\n", $event['description']) . $videoCallLink . "\r\n";
            $icalendar .= "DTSTART:" . DateTime::format($event['start_time']) . "\r\n";
            $icalendar .= "DTEND:" . DateTime::format($event['end_time']) . "\r\n";
            if ($event->freq) {
                switch ($event->freq) {
                    case 'DAILY':
                        $icalendar .= "RRULE:FREQ=DAILY;UNTIL=" . DateTime::format($event['freq_until']) . "\r\n";
                        break;
                    case 'WEEKLY':
                        $icalendar .= "RRULE:FREQ=WEEKLY;BYDAY=" . $event->freq_settings . ";UNTIL=" . DateTime::format($event['freq_until']) . "\r\n";
                        break;
                }
            }
            foreach ($event->user as $user) {

                $status = $user->pivot->attending ? 'ACCEPTED' : 'DECLINED';
                $icalendar .= "ATTENDEE;PARTSTAT=" . $status . ";CN=" . $user->name . ':mailto:' . $user->email . "\r\n";
            }

            $icalendar .= "ORGANIZER;CN=" . $event->creator->name . ":mailto:john.doe@example.com\r\n";
            $icalendar .= $alarm;
            if ($event->creator->id != Auth::id()) {
                $icalendar .= "COLOR:#FF5733\r\n";
            }
            $icalendar .= "END:VEVENT\r\n";
        }

        foreach ($tasks as $task) {

            $taskUrl = config('app.url') . '/projects/' . $task->project_id . '/backlog?task=' . $task->task_id;
            $icalendar .= "BEGIN:VEVENT\r\n";
            $icalendar .= "UID:" . \Str::slug(config('app.url') . ' ' . Task::class) . $task->id . "\r\n";
            ;
            $icalendar .= "SUMMARY:" . $task->name . "\r\n";
            $icalendar .= "DESCRIPTION: For more details click <a href='" . $taskUrl . "'>Here</a>\r\n";
            $icalendar .= "DTSTART:" . DateTime::format($task->due_date) . "\r\n";
            $icalendar .= "DTEND:" . DateTime::format($task->due_date) . "\r\n";
            $icalendar .= $alarm;
            $icalendar .= "END:VEVENT\r\n";
        }



        $icalendar .= "END:VCALENDAR\r\n";

        \Log::info("message", [$icalendar]);
        return $icalendar;
    }

    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_event')->withPivot('attending');
    }
}
