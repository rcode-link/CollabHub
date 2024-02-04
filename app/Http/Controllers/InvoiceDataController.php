<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInvoiceDataRequest;
use App\Http\Requests\UpdateInvoiceDataRequest;
use App\Models\InvoiceData;
use Illuminate\Validation\Rules\Enum;
use \App\Helpers\Enums\InvoiceData as InvoiceDataEnum;

class InvoiceDataController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {

        $this->validate(request(), [
            'type' => [new Enum(InvoiceDataEnum::class)]
        ]);

        return InvoiceData::where('type', request()->get('type'))->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreInvoiceDataRequest $request)
    {
        //
        InvoiceData::create($request->validated());
    }

    /**
     * Display the specified resource.
     */
    public function show(InvoiceData $invoiceData)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateInvoiceDataRequest $request, InvoiceData $data)
    {
        $data->update($request->validated());
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(InvoiceData $data)
    {
        $data->delete();
        //
    }
}
