<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VacationGroup extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'days_per_year',
        'period_start',
        'period_end',
        'company_id',
    ];

    protected $casts = [
        'period_start' => 'date',
        'period_end' => 'date',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'vacation_group_user')->withPivot('days_allocated')->withTimestamps();
    }

    public function events(): HasMany
    {
        return $this->hasMany(Event::class);
    }

    public function getAllocatedDaysForUser(User $user): int
    {
        $pivot = $this->users()->where('user_id', $user->id)->first();

        return $pivot ? $pivot->pivot->days_allocated : $this->days_per_year;
    }

    public function getUsedDaysForUser(User $user): int
    {
        return (int) $this->events()
            ->where('user_id', $user->id)
            ->where('type', 'vacation')
            ->where('approved', true)
            ->where('start_time', '>=', $this->period_start)
            ->where('start_time', '<=', $this->period_end)
            ->get()
            ->sum(function ($event) {
                $end = $event->freq_until ? $event->freq_until : $event->start_time;

                return max(1, (int) ceil($event->start_time->diffInDays($end)));
            });
    }
}
