<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PushNotificationController extends Controller
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
    public function store(Request $request)
    {
        $endpoint = $request->get('endpoint');
        $key = $request->get('keys')['p256dh'];
        $token = $request->get('keys')['auth'];
        auth()->user()->updatePushSubscription($endpoint, $key, $token);
        return response()->noContent();
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
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
