<?php

namespace App\Http\Controllers;

use App\Http\Resources\VacationGroupResource;
use App\Http\Resources\VacationHistoryResource;
use App\Models\User;
use App\Service\VacationService;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class VacationStatsController extends Controller
{
    public function __construct(private VacationService $vacationService) {}

    public function myStats()
    {
        $stats = $this->vacationService->getStatsForUser(Auth::user());

        return response()->json([
            'data' => collect($stats)->map(fn ($s) => [
                'group' => new VacationGroupResource($s['group']),
                'allocated' => $s['allocated'],
                'used' => $s['used'],
                'remaining' => $s['remaining'],
            ]),
        ]);
    }

    public function userStats(User $user)
    {
        $company = Auth::user()->company()->first();
        abort_if(! $company, Response::HTTP_FORBIDDEN);

        Auth::user()->authorize('can-approve-vacation', $company);

        $stats = $this->vacationService->getStatsForUser($user);
        $history = $this->vacationService->getHistoryForUser($user);

        return response()->json([
            'data' => [
                'stats' => collect($stats)->map(fn ($s) => [
                    'group' => new VacationGroupResource($s['group']),
                    'allocated' => $s['allocated'],
                    'used' => $s['used'],
                    'remaining' => $s['remaining'],
                ]),
                'history' => VacationHistoryResource::collection($history),
            ],
        ]);
    }
}
