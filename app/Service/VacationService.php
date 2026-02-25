<?php

namespace App\Service;

use App\Models\User;
use App\Models\VacationGroup;

class VacationService
{
    public function getStatsForUser(User $user): array
    {
        $company = $user->company()->first();
        if (! $company) {
            return [];
        }

        $groups = VacationGroup::where('company_id', $company->id)->get();

        return $groups->map(function (VacationGroup $group) use ($user) {
            $allocated = $group->getAllocatedDaysForUser($user);
            $used = $group->getUsedDaysForUser($user);

            return [
                'group' => $group,
                'allocated' => $allocated,
                'used' => $used,
                'remaining' => $allocated - $used,
            ];
        })->toArray();
    }

    public function getHistoryForUser(User $user): \Illuminate\Database\Eloquent\Collection
    {
        return $user->events()
            ->where('type', 'vacation')
            ->with('vacationGroup', 'chat')
            ->orderByDesc('start_time')
            ->get();
    }
}
