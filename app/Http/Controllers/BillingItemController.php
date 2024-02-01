<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBillingItemRequest;
use App\Http\Requests\UpdateBillingItemRequest;
use App\Models\BillingItem;
use App\Http\Resources\BillingItemResource;

class BillingItemController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return BillingItemResource::collection(BillingItem::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreBillingItemRequest $request)
    {
        BillingItem::create($request->validated());
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
        $billingItem->delete();
    }
}
