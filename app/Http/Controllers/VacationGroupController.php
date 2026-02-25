<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreVacationGroupRequest;
use App\Http\Requests\UpdateVacationGroupRequest;
use App\Http\Resources\VacationGroupResource;
use App\Models\VacationGroup;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class VacationGroupController extends Controller
{
    public function index()
    {
        $company = Auth::user()->company()->first();
        abort_if(! $company, Response::HTTP_NOT_FOUND);

        Auth::user()->authorize('can-update-company', $company);

        return VacationGroupResource::collection(
            VacationGroup::where('company_id', $company->id)->get()
        );
    }

    public function store(StoreVacationGroupRequest $request)
    {
        $company = Auth::user()->company()->first();
        abort_if(! $company, Response::HTTP_NOT_FOUND);

        Auth::user()->authorize('can-update-company', $company);

        VacationGroup::create([
            ...$request->validated(),
            'company_id' => $company->id,
        ]);

        return response()->noContent();
    }

    public function update(UpdateVacationGroupRequest $request, VacationGroup $vacationGroup)
    {
        $company = Auth::user()->company()->first();
        abort_if(! $company || $vacationGroup->company_id !== $company->id, Response::HTTP_FORBIDDEN);

        Auth::user()->authorize('can-update-company', $company);

        $vacationGroup->update($request->validated());

        return response()->noContent();
    }

    public function destroy(VacationGroup $vacationGroup)
    {
        $company = Auth::user()->company()->first();
        abort_if(! $company || $vacationGroup->company_id !== $company->id, Response::HTTP_FORBIDDEN);

        Auth::user()->authorize('can-update-company', $company);

        $vacationGroup->delete();

        return response()->noContent();
    }
}
