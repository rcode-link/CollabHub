<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBillingItemRequest;
use App\Http\Requests\UpdateBillingItemRequest;
use App\Models\BillingItem;

class BillingItemController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreBillingItemRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(BillingItem $billingItem)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateBillingItemRequest $request, BillingItem $billingItem)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(BillingItem $billingItem)
    {
        //
    }
}
