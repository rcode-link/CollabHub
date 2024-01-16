<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdatePasswordRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Response;

class UserController extends Controller
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
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id)
    {
        $user = User::with('manager')->whereId($id)->withTrashed()->firstOrFail();
        return new UserResource($user);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, User $user)
    {
        \Auth::user()->authorize('can-delete-users', \Auth::user()->company()->first());
        $user->update($request->validated());

        $user->load('manager');
        return new UserResource($user);
    }


    public function updatePassword(UpdatePasswordRequest $request)
    {
        \Auth::user()->update([
            'password' => Hash::make($request->get('password'))
        ]);
        return response()->noContent();
    }
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, int $id)
    {
        $user = User::with('manager')->whereId($id)->withTrashed()->firstOrFail();
        if ($request->get('type') === 'delete') {
            \Auth::user()->authorize('can-delete-users', \Auth::user()->company()->first());
            $user->media()->delete();
            $user->update([
                'name' => 'deleted_user',
                'email' => 'deleted' . \Str::random(5) . '@mail.com',
                'password' => 'Deleted'
            ]);
            $user->delete();
        }

        if ($request->get('type') === 'deactivate') {
            \Auth::user()->authorize('can-deactivate-users', \Auth::user()->company()->first());
            $user->delete();
        }

        if ($request->get('type') === 'restore') {
            abort_if($user->deleted_at && $user->name === 'deleted_user', Response::HTTP_FORBIDDEN, 'User is deleted');
            \Auth::user()->authorize('can-deactivate-users', \Auth::user()->company()->first());
            $user->restore();
        }

        return new UserResource($user);
    }
}
