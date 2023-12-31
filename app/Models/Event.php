<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

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
 * @mixin \Eloquent
 */
class Event extends Model
{
    use HasFactory;

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
    ];

    protected $casts = [
        'end_time' => 'datetime',
        'start_time' => 'datetime'
    ];

    public function creator(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public static function convertToICalendarFormat(): string
    {

        $events = Event::query()
            ->with(['creator', 'user'])
            ->where(function (Builder $query) {
                $query->where('user_id', \Auth::id())
                    ->orWhereHas('user', fn(Builder $builder) => $builder->where('user_id', \Auth::id()));
            })->get();

        $tasks = Task::query()
            ->where('user_id', Auth::id())
            ->with('type', 'owner', 'project')
            ->whereNotNull('due_date')
            ->whereHas('taskSprintData', function (Builder $builder){
                $builder->whereHas('status', fn (Builder $query) => $query->where('open', true));
            })->get();
        $icalendar = "BEGIN:VCALENDAR\r\n";



        $alarm = "BEGIN:VALARM\r\nTRIGGER:-PT15M\r\nDESCRIPTION:Reminder\r\nACTION:DISPLAY\r\nEND:VALARM\r\n";

        foreach ($events as $event) {
            $icalendar .= "BEGIN:VEVENT\r\n";
            $icalendar .= "UID:" . \Str::slug(config('app.url') . ' ' . Event::class) . $event->id . "\r\n";;
            $icalendar .= "SUMMARY:" . $event['summary'] . "\r\n";
            $icalendar .= "DESCRIPTION:" .  str_replace("\n", "\\n", $event['description']) . "\r\n";
            $icalendar .= "DTSTART:" . date('Ymd\THis', strtotime($event['start_time'])) . "\r\n";
            $icalendar .= "DTEND:" . date('Ymd\THis', strtotime($event['end_time'])) . "\r\n";
            if ($event->freq) {
                switch ($event->freq) {
                    case 'DAILY':
                        $icalendar .= "RRULE:FREQ=DAILY;UNTIL=" . date('Ymd\THis', strtotime($event['freq_until'])) . "\r\n";
                        break;
                    case 'WEEKLY':
                        $icalendar .= "RRULE:FREQ=WEEKLY;BYDAY=" . $event->freq_settings . ";UNTIL=" . date('Ymd\THis', strtotime($event['freq_until'])) . "\r\n";
                        break;
                }
            }
            foreach ($event->user as $user) {

                $icalendar .= "ATTENDEE;CN=" . $user->name . ':mailto:' . $user->email . "\r\n";
            }


            $icalendar .= "ORGANIZER;CN=" . $event->creator->name . ":mailto:john.doe@example.com\r\n";
            $icalendar .= $alarm;

            if ($event->creator->id != Auth::id()) {
                $icalendar .= "COLOR:#FF5733\r\n";
            }

            $icalendar .= "END:VEVENT\r\n";
        }

        foreach ($tasks as $task) {

            $taskUrl = config('app.url') . '/projects/'. $task->project_id .'/backlog?task=' . $task->task_id;
            $icalendar .= "BEGIN:VEVENT\r\n";
            $icalendar .= "UID:" . \Str::slug(config('app.url') . ' ' . Task::class) . $task->id . "\r\n";;
            $icalendar .= "SUMMARY:" . $task->name . "\r\n";
            $icalendar .= "DESCRIPTION: For more details click <a href='" . $taskUrl . "'>Here</a>\r\n";
            $icalendar .= "DTSTART:" . date('Ymd\THis', strtotime($task->due_date)) . "\r\n";
            $icalendar .= "DTEND:" . date('Ymd\THis', strtotime($task->due_date)) . "\r\n";
            $icalendar .= $alarm;
            $icalendar .= "END:VEVENT\r\n";
        }



        $icalendar .= "END:VCALENDAR\r\n";

        return $icalendar;
    }

    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_event')->withPivot('attending');
    }
}
