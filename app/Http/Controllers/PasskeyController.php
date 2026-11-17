<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePasskeyRequest;
use App\Http\Resources\PasskeyResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;
use Laravel\Passkeys\Actions\DeletePasskey;
use Laravel\Passkeys\Actions\GenerateRegistrationOptions;
use Laravel\Passkeys\Actions\StorePasskey;
use Laravel\Passkeys\Passkey;
use Laravel\Passkeys\Passkeys;
use Laravel\Passkeys\Support\WebAuthn;

class PasskeyController extends Controller
{
    /**
     * List the authenticated user's passkeys.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        return PasskeyResource::collection($request->user()->passkeys()->latest()->get());
    }

    /**
     * Get WebAuthn registration options for the authenticated user.
     */
    public function options(Request $request, GenerateRegistrationOptions $generate): JsonResponse
    {
        $user = $request->user();
        $options = $generate($user);

        Cache::put(
            StorePasskeyRequest::cacheKey($user->getKey()),
            WebAuthn::toJson($options),
            now()->addMilliseconds(Passkeys::timeout())->addMinute(),
        );

        return response()->json(['options' => WebAuthn::toBrowserArray($options)]);
    }

    /**
     * Register a new passkey for the authenticated user.
     */
    public function store(StorePasskeyRequest $request, StorePasskey $storePasskey): PasskeyResource
    {
        $passkey = $storePasskey(
            $request->user(),
            $request->string('name')->toString(),
            $request->credential(),
            $request->registrationOptions(),
        );

        return new PasskeyResource($passkey);
    }

    /**
     * Delete one of the authenticated user's passkeys.
     */
    public function destroy(Request $request, Passkey $passkey, DeletePasskey $deletePasskey): Response
    {
        abort_unless($passkey->user_id === $request->user()->getKey(), Response::HTTP_FORBIDDEN);

        $deletePasskey($request->user(), $passkey);

        return response()->noContent();
    }
}
