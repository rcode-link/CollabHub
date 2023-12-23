<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Resources\LoginResource;
use App\Models\User;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class LoginController extends Controller
{
    /**
     * Handle the incoming request.
     * @unauthenticated
     */
    public function __invoke(LoginRequest $request)
    {
        $data = $request->validated();
        $user = User::where('email', $data['email'])->first();



        if (!$user || !Hash::check($data['password'], $user->password)) {
            return response()->json([
                'data' => __('login.bad_credentials')
            ], Response::HTTP_UNAUTHORIZED);
        }
        return new LoginResource($user->createToken(Str::random(), []));
    }
}
