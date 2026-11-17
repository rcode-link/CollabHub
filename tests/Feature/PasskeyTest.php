<?php

namespace Tests\Feature;

use App\Http\Requests\PasskeyLoginRequest;
use App\Http\Requests\StorePasskeyRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Laravel\Passkeys\Passkey;
use Laravel\Sanctum\Sanctum;
use ParagonIE\ConstantTime\Base64UrlSafe;
use Tests\TestCase;

class PasskeyTest extends TestCase
{
    use RefreshDatabase;

    private function createPasskey(User $user, string $name = 'Laptop'): Passkey
    {
        return $user->passkeys()->create([
            'name' => $name,
            'credential_id' => Base64UrlSafe::encodeUnpadded(random_bytes(16)),
            'credential' => [],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function fakeCredential(string $challenge): array
    {
        $clientData = Base64UrlSafe::encodeUnpadded(json_encode([
            'type' => 'webauthn.get',
            'challenge' => Base64UrlSafe::encodeUnpadded($challenge),
            'origin' => config('app.url'),
        ]));

        return [
            'id' => 'abc',
            'rawId' => 'abc',
            'type' => 'public-key',
            'response' => [
                'clientDataJSON' => $clientData,
                'authenticatorData' => Base64UrlSafe::encodeUnpadded(random_bytes(32)."\x05".str_repeat("\0", 4)),
                'signature' => Base64UrlSafe::encodeUnpadded('sig'),
            ],
        ];
    }

    public function test_guest_cannot_manage_passkeys(): void
    {
        $this->getJson('/api/v1/user/passkeys')->assertUnauthorized();
        $this->getJson('/api/v1/user/passkeys/options')->assertUnauthorized();
        $this->postJson('/api/v1/user/passkeys')->assertUnauthorized();
    }

    public function test_user_lists_only_their_own_passkeys(): void
    {
        $user = User::factory()->create();
        $this->createPasskey($user, 'Mine');
        $this->createPasskey(User::factory()->create(), 'Not mine');

        Sanctum::actingAs($user);

        $this->getJson('/api/v1/user/passkeys')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Mine')
            ->assertJsonMissingPath('data.0.credential');
    }

    public function test_registration_options_are_cached_for_the_user(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->getJson('/api/v1/user/passkeys/options')
            ->assertOk()
            ->assertJsonStructure(['options' => ['challenge', 'rp', 'user']]);

        $this->assertNotNull(Cache::get(StorePasskeyRequest::cacheKey($user->id)));
    }

    public function test_store_fails_without_registration_options(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/v1/user/passkeys', [
            'name' => 'Laptop',
            'credential' => $this->fakeCredential(random_bytes(32)),
        ])->assertUnprocessable()->assertJsonPath('errors.credential.0', 'Passkey registration session expired. Please try again.');
    }

    public function test_store_requires_a_name(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/v1/user/passkeys', [
            'credential' => $this->fakeCredential(random_bytes(32)),
        ])->assertUnprocessable()->assertJsonValidationErrors('name');
    }

    public function test_user_can_delete_their_passkey(): void
    {
        $user = User::factory()->create();
        $passkey = $this->createPasskey($user);
        Sanctum::actingAs($user);

        $this->deleteJson("/api/v1/user/passkeys/{$passkey->id}")->assertNoContent();

        $this->assertModelMissing($passkey);
    }

    public function test_user_cannot_delete_another_users_passkey(): void
    {
        $passkey = $this->createPasskey(User::factory()->create());
        Sanctum::actingAs(User::factory()->create());

        $this->deleteJson("/api/v1/user/passkeys/{$passkey->id}")->assertForbidden();

        $this->assertModelExists($passkey);
    }

    public function test_login_options_are_public_and_cached_by_challenge(): void
    {
        $response = $this->getJson('/api/v1/passkeys/login/options')
            ->assertOk()
            ->assertJsonStructure(['options' => ['challenge']]);

        $challenge = Base64UrlSafe::decodeNoPadding($response->json('options.challenge'));

        $this->assertNotNull(Cache::get(PasskeyLoginRequest::cacheKey($challenge)));
    }

    public function test_login_rejects_a_challenge_the_server_did_not_issue(): void
    {
        $this->postJson('/api/v1/passkeys/login', [
            'credential' => $this->fakeCredential(random_bytes(32)),
        ])->assertUnprocessable()->assertJsonPath('errors.credential.0', 'Passkey verification session expired. Please try again.');
    }

    public function test_login_challenge_can_only_be_used_once(): void
    {
        $response = $this->getJson('/api/v1/passkeys/login/options');
        $challenge = Base64UrlSafe::decodeNoPadding($response->json('options.challenge'));

        $this->postJson('/api/v1/passkeys/login', [
            'credential' => $this->fakeCredential($challenge),
        ])->assertUnprocessable();

        $this->assertNull(Cache::get(PasskeyLoginRequest::cacheKey($challenge)));
    }
}
