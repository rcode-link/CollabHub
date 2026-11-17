<?php

namespace App\Http\Requests;

use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\ValidationException;
use Laravel\Passkeys\Http\Requests\PasskeyRegistrationRequest;
use Laravel\Passkeys\Support\WebAuthn;
use Webauthn\PublicKeyCredentialCreationOptions;

/**
 * Passkey registration request for the stateless (Bearer token) API.
 *
 * The package keeps the registration options in the session; the API has no
 * session, so the options are kept in the cache keyed by the user instead.
 */
class StorePasskeyRequest extends PasskeyRegistrationRequest
{
    public static function cacheKey(int|string $userId): string
    {
        return "passkeys.registration.{$userId}";
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => __('Please give the passkey a name.'),
            'credential.required' => __('The passkey credential is missing.'),
        ];
    }

    public function registrationOptions(): PublicKeyCredentialCreationOptions
    {
        $serialized = Cache::pull(self::cacheKey($this->user()->getKey()));

        if (! $serialized) {
            throw ValidationException::withMessages([
                'credential' => __('Passkey registration session expired. Please try again.'),
            ]);
        }

        return WebAuthn::fromJson($serialized, PublicKeyCredentialCreationOptions::class);
    }
}
