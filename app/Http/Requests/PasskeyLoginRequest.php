<?php

namespace App\Http\Requests;

use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\ValidationException;
use Laravel\Passkeys\Http\Requests\PasskeyVerificationRequest;
use Laravel\Passkeys\Support\WebAuthn;
use Webauthn\AuthenticatorAssertionResponse;
use Webauthn\PublicKeyCredentialRequestOptions;

/**
 * Passkey login request for the stateless (Bearer token) API.
 *
 * Login options are cached under their challenge, which the browser signs
 * into clientDataJSON, so the submit can find them without a session. Each
 * challenge can only be used once.
 */
class PasskeyLoginRequest extends PasskeyVerificationRequest
{
    public static function cacheKey(string $challenge): string
    {
        return 'passkeys.login.'.hash('sha256', $challenge);
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'credential.required' => __('The passkey credential is missing.'),
        ];
    }

    public function verificationOptions(): PublicKeyCredentialRequestOptions
    {
        $response = $this->credential()->response;

        $serialized = $response instanceof AuthenticatorAssertionResponse
            ? Cache::pull(self::cacheKey($response->clientDataJSON->challenge))
            : null;

        if (! $serialized) {
            throw ValidationException::withMessages([
                'credential' => __('Passkey verification session expired. Please try again.'),
            ]);
        }

        return WebAuthn::fromJson($serialized, PublicKeyCredentialRequestOptions::class);
    }
}
