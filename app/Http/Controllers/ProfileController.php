<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProfileController extends Controller
{
    public function view(Request $request)
    {
        return cache()->remember('user_'.$request->user()->id, 8 * 60 * 60, fn () => new UserResource($request->user()));
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'required'],
            'email' => ['sometimes', 'email', 'unique:users,email,'.Auth::id()],
            'subscribe_to_all_tasks' => ['sometimes', 'boolean'],
        ]);

        \auth()->user()->update($data);
        cache()->forget('user_'.Auth::id());

        return response()->noContent();
    }

    public function updateProfilePicture(Request $request)
    {

        $request->user()->addMedia($request->file('avatar'))->toMediaCollection('avatar');

        return response()->json(['data' => 'ok']);
    }
}
