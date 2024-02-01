<?php

namespace App\Http\Controllers;

use App\Events\InvoiceItemsUpdate;
use App\Http\Requests\StoreInvoiceItemRequest;
use App\Http\Requests\UpdateInvoiceItemRequest;
use App\Models\BillingItem;
use App\Models\Invoice;
use App\Models\InvoiceItem;

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
        $invoice = Invoice::query()->whereId($request->get('invoice_id'))->firstOrFail();
        $billingItem = BillingItem::whereId($request->get('item_id'))->firstOrFail();
        $invoice->items()->create([
            "price" => $billingItem->price,
            "qty" => 100,
            "total" => $billingItem->price,
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
        $item = InvoiceItem::whereId($invoiceItem)->firstOrFail();
        $price = $request->get('price') * 100;
        $qty = $request->get('qty');
        $item->update([
            "price" => $price,
            "qty" => $qty * 100,
            "total" => $price * $qty,
        ]);

        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $invoiceItem = InvoiceItem::whereId($id)->firstOrFail();
        $invoiceItem->delete();
        //
    }
}
