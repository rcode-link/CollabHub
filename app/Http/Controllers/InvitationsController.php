<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInvitationsRequest;
use App\Http\Requests\UpdateInvitationsRequest;
use App\Http\Resources\InvitationResource;
use App\Models\Invitations;
use Illuminate\Support\Facades\Auth;

class InvitationsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        Auth::user()->authorize('can-invite-users', Auth::user()->company->first());
        return InvitationResource::collection(Invitations::where('company_id', Auth::user()->company->first()->id)->paginate());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreInvitationsRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Invitations $invitations)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateInvitationsRequest $request, Invitations $invitations)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Invitations $invite)
    {
        Auth::user()->authorize('can-invite-users', Auth::user()->company->first());

        $invite->delete();

        return response()->json(['status' => 'ok']);

        //
    }
}
