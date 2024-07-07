<?php

namespace App\Http\Controllers;

use App\Events\InvoiceItemsUpdate;
use App\Http\Requests\StoreInvoiceRequest;
use App\Http\Requests\UpdateInvoiceRequest;
use App\Http\Resources\InvoiceResource;
use App\Models\Company;
use App\Models\Invoice;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;

class InvoiceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $data = Invoice::whereCompanyId(request()->get('company_id'))
            ->withSum('paymants', 'value');
        return InvoiceResource::collection($data->paginate());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreInvoiceRequest $request)
    {
        $data = $request->validated();
        $data['date'] = Carbon::parse($data['date']);
        $data['due_date'] = Carbon::parse($data['due_date']);
        $data['sent'] = false;
        $data['note'] = '';
        $data['total'] = 0;
        $data['discont'] = 0;
        $invoice = Invoice::create($data);

        return new InvoiceResource($invoice);
    }

    /**
     * Display the specified resource.
     */
    public function show(Invoice $invoice)
    {

        $invoice->load('company', 'company.currency', 'items', 'items.billingItem');
        return new InvoiceResource($invoice);
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateInvoiceRequest $request, Invoice $invoice)
    {
        $invoice->update($request->validated());
        InvoiceItemsUpdate::dispatch($invoice->id);

    }

    public function download(Invoice $invoice)
    {
        $invoice->load('items', 'items.billingItem', 'company', 'company.currency');
        $company = Company::whereIsCostumerCompany(false)->firstOrFail();
        $pdf = Pdf::loadView('pdf.invoice', ['model' => $invoice, 'company' => $company]);
        return $pdf->stream($invoice->number . '.pdf');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Invoice $invoice)
    {
        //
    }
}
