<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreVacationGroupUserRequest;
use App\Http\Resources\VacationGroupUserResource;
use App\Models\User;
use App\Models\VacationGroup;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class VacationGroupUserController extends Controller
{
    public function index(VacationGroup $vacationGroup)
    {
        $company = Auth::user()->company()->first();
        abort_if(! $company || $vacationGroup->company_id !== $company->id, Response::HTTP_FORBIDDEN);

        Auth::user()->authorize('can-update-company', $company);

        return VacationGroupUserResource::collection($vacationGroup->users);
    }

    public function store(StoreVacationGroupUserRequest $request, VacationGroup $vacationGroup)
    {
        $company = Auth::user()->company()->first();
        abort_if(! $company || $vacationGroup->company_id !== $company->id, Response::HTTP_FORBIDDEN);

        Auth::user()->authorize('can-update-company', $company);

        $vacationGroup->users()->syncWithoutDetaching([
            $request->validated('user_id') => ['days_allocated' => $request->validated('days_allocated')],
        ]);

        return response()->noContent();
    }

    public function destroy(VacationGroup $vacationGroup, User $user)
    {
        $company = Auth::user()->company()->first();
        abort_if(! $company || $vacationGroup->company_id !== $company->id, Response::HTTP_FORBIDDEN);

        Auth::user()->authorize('can-update-company', $company);

        $vacationGroup->users()->detach($user->id);

        return response()->noContent();
    }
}
