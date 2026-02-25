<?php

namespace App\Http\Controllers;

use App\Events\InvoiceItemsUpdate;
use App\Http\Requests\StoreInvoiceRequest;
use App\Http\Requests\UpdateInvoiceRequest;
use App\Http\Resources\InvoiceResource;
use App\Models\Company;
use App\Models\Invoice;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class InvoiceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        Auth::user()->authorize('can-view-billing-info', Auth::user()->company()->first());

        $data = Invoice::query()
            ->with('company')
            ->withSum('payments', 'value')
            ->when(request('company_id'), fn ($q, $id) => $q->where('company_id', $id))
            ->when(request('search'), fn ($q, $s) => $q->where('number', 'like', "%{$s}%"))
            ->when(request('date_from'), fn ($q, $d) => $q->where('date', '>=', $d))
            ->when(request('date_to'), fn ($q, $d) => $q->where('date', '<=', $d))
            ->when(request('status'), function ($q, $status) {
                return match ($status) {
                    'draft' => $q->where('sent', false),
                    'sent' => $q->where('sent', true)
                        ->whereColumn('total', '>', \DB::raw('COALESCE((SELECT SUM(value) FROM payments WHERE payments.invoice_id = invoices.id), 0)'))
                        ->where(fn ($q2) => $q2->whereNull('due_date')->orWhere('due_date', '>=', now()->toDateString())),
                    'paid' => $q->where('sent', true)->where('total', '>', 0)
                        ->whereColumn('total', '<=', \DB::raw('COALESCE((SELECT SUM(value) FROM payments WHERE payments.invoice_id = invoices.id), 0)')),
                    'partial' => $q->where('sent', true)
                        ->whereRaw('COALESCE((SELECT SUM(value) FROM payments WHERE payments.invoice_id = invoices.id), 0) > 0')
                        ->whereColumn('total', '>', \DB::raw('COALESCE((SELECT SUM(value) FROM payments WHERE payments.invoice_id = invoices.id), 0)')),
                    'overdue' => $q->where('sent', true)
                        ->where('due_date', '<', now()->toDateString())
                        ->whereColumn('total', '>', \DB::raw('COALESCE((SELECT SUM(value) FROM payments WHERE payments.invoice_id = invoices.id), 0)')),
                    default => $q,
                };
            })
            ->orderBy('date', 'desc');

        return InvoiceResource::collection($data->paginate());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreInvoiceRequest $request)
    {
        Auth::user()->authorize('can-create-invoice', Auth::user()->company()->first());

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
        Auth::user()->authorize('can-view-billing-info', Auth::user()->company()->first());

        $invoice->load('company', 'company.currency', 'items', 'items.billingItem', 'payments')
            ->loadSum('payments', 'value');

        return new InvoiceResource($invoice);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateInvoiceRequest $request, Invoice $invoice)
    {
        Auth::user()->authorize('can-create-invoice', Auth::user()->company()->first());

        $data = $request->validated();

        if (isset($data['date'])) {
            $data['date'] = Carbon::parse($data['date']);
        }
        if (isset($data['due_date'])) {
            $data['due_date'] = Carbon::parse($data['due_date']);
        }

        $invoice->update($data);
        InvoiceItemsUpdate::dispatch($invoice->id);
    }

    /**
     * Generate the next invoice number for a given company.
     */
    public function nextNumber()
    {
        Auth::user()->authorize('can-create-invoice', Auth::user()->company()->first());

        $company = Company::findOrFail(request('company_id'));
        $prefix = $company->prefix ?? strtoupper(substr($company->name, 0, 3));

        $lastInvoice = Invoice::where('company_id', $company->id)
            ->where('number', 'like', "INV-{$prefix}-%")
            ->orderByRaw("CAST(SUBSTRING_INDEX(number, '-', -1) AS UNSIGNED) DESC")
            ->first();

        $nextNum = 1;
        if ($lastInvoice) {
            $parts = explode('-', $lastInvoice->number);
            $lastNum = (int) end($parts);
            $nextNum = $lastNum + 1;
        }

        $paddedNum = str_pad($nextNum, 5, '0', STR_PAD_LEFT);

        return response()->json([
            'number' => "INV-{$prefix}-{$paddedNum}",
            'prefix' => $prefix,
        ]);
    }

    public function download(Invoice $invoice)
    {
        Auth::user()->authorize('can-view-billing-info', Auth::user()->company()->first());

        $invoice->load('items', 'items.billingItem', 'company', 'company.currency');
        $company = Company::whereIsCostumerCompany(false)->firstOrFail();
        $pdf = Pdf::loadView('pdf.invoice', ['model' => $invoice, 'company' => $company]);

        return $pdf->stream($invoice->number.'.pdf');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Invoice $invoice)
    {
        Auth::user()->authorize('can-create-invoice', Auth::user()->company()->first());

        $invoice->items()->delete();
        $invoice->delete();

        return response()->noContent();
    }
}
