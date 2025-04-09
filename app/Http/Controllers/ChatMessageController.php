<?php

namespace App\Http\Controllers;

use App\Events\ChatMessageCreated;
use App\Events\ChatMessageDeleted;
use App\Events\ChatUpdate;
use App\Http\Requests\ChatMessageCreateRequest;
use App\Http\Resources\ChatMessageResource;
use App\Models\Chat;
use App\Models\ChatMessage;
use App\Notifications\PushNotification;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Notification;

class ChatMessageController extends Controller
{
    /**
     * @param Request $request
     * @param Chat $chat
     * @return AnonymousResourceCollection<LengthAwarePaginator<ChatMessageResource>>
     */
    public function index(Request $request, Chat $chat)
    {
        $chat->numberOfUnreadMessages()->update([
            'reaction' => 'seen'
        ]);
        $messages = $chat->messages()
            ->with('user', 'media', 'videocalls', 'parent', 'messageReactions')
            ->where('chat_id', $chat->id)
            ->orderByDesc('created_at')
            ->paginate(30);
        return ChatMessageResource::collection($messages);
    }

    public function store(ChatMessageCreateRequest $request, Chat $chat)
    {
        $data['message'] = json_decode($request->get('message'));
        $data['parent_id'] = $request->get('parent_id');
        $data['user_id'] = Auth::id();
        $data['chat_id'] = $chat->id;

        $message = ChatMessage::create($data);

        $chat->numberOfUnreadMessages()->update([
            'reaction' => 'seen'
        ]);

        if ($request->files->count()) {
            $message
                ->addMultipleMediaFromRequest(['files'])
                ->each(function ($fileAdder) {
                    $fileAdder->toMediaCollection('files');
                });
        }

        $chat->load('users', 'users.pushSubscriptions');
        $message->messageViews()->insert($chat->users->pluck('id')->map(function ($user_id) use ($message) {
            return [
                'user_id' => $user_id,
                'chat_message_id' => $message->id,
                'reaction' => auth()->id() === $user_id ? 'seen' : null
            ];
        })->toArray());

        $message->load('user', 'media', 'videocalls', 'parent', 'messageReactions');
        ChatUpdate::dispatch($chat->users->toArray(), $message);
        Notification::send($chat->users->filter(fn($user) => $user->id == auth()->id()), new PushNotification($message));
        ChatMessageCreated::dispatch($message);
        return response()->noContent();
    }

    public function destroy(Request $request, $id)
    {
        $chatMessage = ChatMessage::query()->where('id', $id)->firstOrFail();
        abort_if($chatMessage->user_id !== Auth::id(), Response::HTTP_FORBIDDEN, 'You can delete only your messages');
        $chatId = $chatMessage->chat_id;
        $chatMessage->videocalls()->delete();
        $chatMessage->messageReactions()->delete();
        $chatMessage->delete();
        $newMessage = new ChatMessage();
        $newMessage->chat_id = $chatId;
        ChatUpdate::dispatch(Chat::query()->where('id', $chatId)->first()->users()->get()->toArray(), $newMessage);
        ChatMessageDeleted::dispatch($id, $chatId);
        return response()->noContent();
    }
}
