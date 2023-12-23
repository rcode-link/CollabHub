<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCompanyRequest;
use App\Http\Requests\UpdateCompanyRequest;
use App\Models\Company;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CompanyController extends Controller
{
    /**
     * Return company for user.
     */
    public function index()
    {
        $permission = Auth::user()->permissions()->where('permission', 'like', 'can-view-company.%')
            ->with('resourceable')
            ->first();

        return array_merge($permission->resourceable->toArray(),
            [
                'avatar' => $permission->resourceable->getFirstMediaUrl('avatar')
            ]
        );
    }

    public function getKeys(Request $request)
    {
        $projectIds = Auth::user()->permissions()->select('resourceable_id')->where('resourceable_type', Project::class)->get();

        return Project::select('key')->whereIn('id', $projectIds->toArray())->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCompanyRequest $request)
    {
        $this->authorize('create', Company::class);

        return $request->all();
    }

    /**
     * Display the specified resource.
     */
    public function show(Company $company)
    {
        $this->authorize('view', $company);
        return array_merge($company->toArray(),
            [
                'avatar' => $company->getFirstMediaUrl('avatar')
            ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCompanyRequest $request, Company $company)
    {
        $this->authorize('update', $company);

        $company->update([
            'name' => $request->get('name')
        ]);

        if ($request->file('avatar')) {
            $company
                ->addMedia($request->file('avatar'))
                ->toMediaCollection('avatar');
        }

        return $company;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Company $company)
    {
        //
    }
}
