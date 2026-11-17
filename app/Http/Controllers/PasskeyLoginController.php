<?php

namespace App\Http\Controllers;

use App\Http\Requests\PasskeyLoginRequest;
use App\Http\Resources\LoginResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Laravel\Passkeys\Actions\GenerateVerificationOptions;
use Laravel\Passkeys\Actions\VerifyPasskey;
use Laravel\Passkeys\Exceptions\InvalidPasskeyException;
use Laravel\Passkeys\Passkeys;
use Laravel\Passkeys\Support\WebAuthn;

class PasskeyLoginController extends Controller
{
    /**
     * Get WebAuthn options for signing in with a passkey.
     *
     * @unauthenticated
     */
    public function options(GenerateVerificationOptions $generate): JsonResponse
    {
        $options = $generate();

        Cache::put(
            PasskeyLoginRequest::cacheKey($options->challenge),
            WebAuthn::toJson($options),
            now()->addMilliseconds(Passkeys::timeout())->addMinute(),
        );

        return response()->json(['options' => WebAuthn::toBrowserArray($options)]);
    }

    /**
     * Verify the passkey assertion and issue an API token.
     *
     * @unauthenticated
     */
    public function store(PasskeyLoginRequest $request, VerifyPasskey $verify): LoginResource
    {
        $passkey = $verify($request->credential(), $request->verificationOptions());

        if (! Passkeys::allowsLogin($request, $passkey)) {
            throw InvalidPasskeyException::make(__('Unable to sign in with this account.'));
        }

        return new LoginResource($passkey->user->createToken(Str::random(), []));
    }
}
