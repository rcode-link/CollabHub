<?php

namespace App\Http\Controllers;

use App\Events\InvoiceItemsUpdate;
use App\Http\Requests\StoreInvoiceItemRequest;
use App\Http\Requests\UpdateInvoiceItemRequest;
use App\Models\BillingItem;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use Illuminate\Support\Facades\Auth;

class InvoiceItemController extends Controller
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
    public function store(StoreInvoiceItemRequest $request)
    {
        Auth::user()->authorize('can-create-invoice', Auth::user()->company()->first());

        $data = $request->validated();
        $invoice = Invoice::findOrFail($data['invoice_id']);
        $billingItem = BillingItem::findOrFail($data['item_id']);
        $vatRate = $data['vat_rate'] ?? $invoice->company->default_vat_rate ?? 0;
        $invoice->items()->create([
            "price" => $billingItem->price,
            "qty" => 100,
            "total" => $billingItem->price,
            "vat_rate" => $vatRate,
            "billing_item_id" => $billingItem->id,
        ]);
        $invoice->load('items', 'items.billingItem');
    }

    /**
     * Display the specified resource.
     */
    public function show(InvoiceItem $invoiceItem)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateInvoiceItemRequest $request, $invoiceItem)
    {
        Auth::user()->authorize('can-create-invoice', Auth::user()->company()->first());

        $data = $request->validated();
        $item = InvoiceItem::findOrFail($invoiceItem);
        $price = $data['price'] * 100;
        $qty = $data['qty'];
        $updateData = [
            "price" => $price,
            "qty" => $qty * 100,
            "total" => $price * $qty,
        ];
        if (isset($data['vat_rate'])) {
            $updateData['vat_rate'] = $data['vat_rate'];
        }
        $item->update($updateData);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        Auth::user()->authorize('can-create-invoice', Auth::user()->company()->first());

        $invoiceItem = InvoiceItem::findOrFail($id);
        $invoiceItem->delete();
    }
}
