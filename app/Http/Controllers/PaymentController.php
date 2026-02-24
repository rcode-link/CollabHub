<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePaymentRequest;
use App\Http\Requests\UpdatePaymentRequest;
use App\Http\Resources\PaymentResource;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class PaymentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        Auth::user()->authorize('can-view-billing-info', Auth::user()->company()->first());

        $data = Payment::with('invoice.company')
            ->when(request('company_id'), fn($q, $id) => $q->whereHas('invoice', fn($q2) => $q2->where('company_id', $id)))
            ->when(request('date_from'), fn($q, $d) => $q->where('date', '>=', $d))
            ->when(request('date_to'), fn($q, $d) => $q->where('date', '<=', $d))
            ->orderBy('date', 'desc');

        return PaymentResource::collection($data->paginate());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePaymentRequest $request)
    {
        Auth::user()->authorize('can-create-invoice', Auth::user()->company()->first());

        $data = $request->validated();
        $data['date'] = Carbon::parse($data['date']);
        $data['value'] = $data['value'] * 100;
        $payment = Payment::create($data);

        return new PaymentResource($payment->load('invoice'));
    }

    /**
     * Display the specified resource.
     */
    public function show(Payment $payment)
    {
        Auth::user()->authorize('can-view-billing-info', Auth::user()->company()->first());

        return new PaymentResource($payment->load('invoice'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePaymentRequest $request, Payment $payment)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Payment $payment)
    {
        Auth::user()->authorize('can-create-invoice', Auth::user()->company()->first());

        $payment->delete();

        return response()->noContent();
    }
}
