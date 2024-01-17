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
        $permission = Auth::user()->permissions()->filter(fn($obj) => $obj['model']['type'] == Company::class)->pluck('model.id')->flatten();

        $comapny = Company::whereIn('id', $permission)->first();
        return array_merge(
            $comapny->toArray(),
            [
                'avatar' => $comapny->getFirstMediaUrl('avatar')
            ]
        );
    }

    /**
     * Returns list of keys for editor to autocomplete
     *
     * @response array{string}
     */
    public function getKeys(Request $request)
    {
        return Auth::user()->permissions()->filter(fn($obj) => $obj['model']['type'] === Project::class)->map(fn($obj) => $obj['model']['key'])->flatten()->toArray();
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
        return array_merge(
            $company->toArray(),
            [
                'avatar' => $company->getFirstMediaUrl('avatar')
            ]
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCompanyRequest $request, Company $company)
    {
        $request->user()->authorize('can-update-company', $company);

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
