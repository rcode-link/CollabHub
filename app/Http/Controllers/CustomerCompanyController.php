<?php

namespace App\Http\Controllers;

use App\Http\Requests\CustomerCompanyRequest;
use App\Http\Resources\CustomerResource;
use App\Models\Company;
use Illuminate\Http\Request;

class CustomerCompanyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        \Auth::user()->authorize('can-view-billing-info', \Auth::user()->company()->first());
        return CustomerResource::collection(Company::whereIsCostumerCompany(true)->paginate());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CustomerCompanyRequest $request)
    {
        $data = $request->validated();
        $data['is_costumer_company'] = true;
        Company::create($data);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return new CustomerResource(Company::whereId($id)->with('currency')->firstOrFail());
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(CustomerCompanyRequest $request, string $id)
    {
        Company::whereId($id)->update($request->validated());
        return response()->noContent();
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
