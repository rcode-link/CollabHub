<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreWebhookRequest;
use App\Http\Requests\UpdateWebhookRequest;
use App\Http\Resources\WebhookResource;
use App\Models\Chat;
use App\Models\Webhook;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class WebhookController extends Controller
{
    public function store(StoreWebhookRequest $request): JsonResponse
    {
        $webhook = Webhook::create([
            'name' => $request->name,
            'token' => Webhook::generateToken(),
            'created_by' => Auth::id(),
        ]);

        $chat = Chat::create([
            'title' => $request->name,
            'chatable_type' => Webhook::class,
            'chatable_id' => $webhook->id,
        ]);

        $users = collect($request->get('user_id', []))->push(Auth::id())->unique();
        $chat->users()->sync($users->map(fn ($id) => ['user_id' => $id]));

        $webhook->load('chat');
        $webhook->chat->load('users');
        $webhook->chat->loadCount('users');

        return response()->json(['data' => new WebhookResource($webhook)], 201);
    }

    public function show(Webhook $webhook): WebhookResource
    {
        $webhook->load('chat');

        return new WebhookResource($webhook);
    }

    public function update(UpdateWebhookRequest $request, Webhook $webhook): WebhookResource
    {
        $webhook->update($request->validated());

        if ($request->has('name') && $webhook->chat) {
            $webhook->chat->update(['title' => $request->name]);
        }

        $webhook->load('chat');

        return new WebhookResource($webhook);
    }

    public function regenerateToken(Webhook $webhook): JsonResponse
    {
        $webhook->update(['token' => Webhook::generateToken()]);
        $webhook->load('chat');

        return response()->json(['data' => new WebhookResource($webhook)]);
    }

    public function destroy(Webhook $webhook): JsonResponse
    {
        $webhook->update(['is_active' => false]);

        return response()->json(null, 204);
    }
}
