<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\View\View;

class ProfileController extends Controller
{
    public function view(Request $request)
    {
        return new UserResource($request->user());
    }

    public function updateProfilePicture(Request $request)
    {

        $request->user()->addMedia($request->file('avatar'))->toMediaCollection('avatar');

        return response()->json(['data' => 'ok']);

    }
}
