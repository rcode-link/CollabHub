<?php

namespace App\Http\Controllers;

use App\Events\ChatMessageCreated;
use App\Events\ChatUpdate;
use App\Models\ChatMessage;
use App\Models\Webhook;
use App\Service\SlackMrkdwnConverter;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class WebhookIngestController extends Controller
{
    public function __invoke(Request $request, string $token): Response
    {
        $webhook = Webhook::where('token', $token)->where('is_active', true)->firstOrFail();
        $chat = $webhook->chat;

        $request->validate([
            'text' => 'required_without:attachments|nullable|string',
            'attachments' => 'sometimes|array',
        ]);

        $converter = new SlackMrkdwnConverter;
        $tiptapDoc = $converter->convertPayload($request->all());

        $webhookMeta = [
            'webhook_name' => $webhook->name,
            'username' => $request->input('username', $webhook->name),
            'icon_url' => $request->input('icon_url'),
            'icon_emoji' => $request->input('icon_emoji'),
        ];

        $message = ChatMessage::create([
            'chat_id' => $chat->id,
            'user_id' => null,
            'message' => $tiptapDoc,
            'webhook_meta' => $webhookMeta,
        ]);

        $chat->load('users');

        $message->messageViews()->insert(
            $chat->users->pluck('id')->map(fn ($userId) => [
                'user_id' => $userId,
                'chat_message_id' => $message->id,
                'reaction' => null,
            ])->toArray()
        );

        $message->load('user', 'media', 'videocalls', 'parent', 'messageReactions');
        ChatUpdate::dispatch($chat->users->toArray(), $message);
        ChatMessageCreated::dispatch($message);

        return response('ok', 200);
    }
}
