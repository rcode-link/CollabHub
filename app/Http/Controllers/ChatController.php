<?php

namespace App\Http\Controllers;

use App\Helpers\Enums\ChatTypes;
use App\Http\Requests\StoreChatRequest;
use App\Http\Requests\UpdateChatRequest;
use App\Http\Resources\ChatResource;
use App\Models\Chat;
use App\Models\ChatMessage;
use App\Models\User;
use App\Models\Webhook;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class ChatController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $chat = Chat::query()
            ->with([
                'users' => function ($builder) {
                    $builder->whereNot('user_id', Auth::id());
                },
            ])
            ->with(['last_message', 'last_message.videocalls', 'last_message.media', 'last_message.user', 'chatable'])
            ->whereHas('users', function ($query) {
                $query->where('user_id', Auth::id());
            })
            ->withCount('users')
            ->withCount('numberOfUnreadMessages')
            ->when($request->get('type') == ChatTypes::USER->value, function (Builder $query) {
                $query->having('users_count', 2)->where('chatable_type', User::class);
            })
            ->when($request->get('type') == ChatTypes::GROUP->value, function (Builder $query) {
                $query->having('users_count', '>', 2);
            })
            ->when($request->get('type') == ChatTypes::SYSTEM->value, function (Builder $query) {
                $query->whereNot('chatable_type', User::class)->whereNot('chatable_type', Webhook::class);
            })
            ->when($request->get('type') == ChatTypes::WEBHOOK->value, function (Builder $query) {
                $query->where('chatable_type', Webhook::class);
            })
            ->orderByDesc(ChatMessage::query()->select('created_at')->whereColumn('chat_messages.chat_id', 'chats.id')->orderByDesc('created_at')->limit(1));

        return ChatResource::collection($chat->paginate());
    }

    public function getNumberOfUnreadMessages(Request $request): JsonResponse
    {
        $numberOfUnreadMessage = Chat::query()
            ->select('id')
            ->whereHas('users', function ($query) {
                $query->where('user_id', Auth::id());
            })
            ->withCount('numberOfUnreadMessages')
            ->having('number_of_unread_messages_count', '!=', 0)
            ->get();

        return \response()->json([
            'messages' => $numberOfUnreadMessage,
            'total' => $numberOfUnreadMessage->sum('number_of_unread_messages_count'),
        ]);
    }

    /**
     * Create new chat
     */
    public function store(StoreChatRequest $request): JsonResponse
    {
        $data = $request->only('title');
        $data['chatable_type'] = User::class;
        $data['chatable_id'] = Auth::id();

        $users = collect($request->get('user_id'))->push(Auth::id());

        $chat = Chat::create($data);

        $chat->users()->sync($users->map(function ($str) {
            return [
                'user_id' => $str,
            ];
        }));

        $chat->load('users');
        $chat->loadCount('users');

        return response()->json(['data' => new ChatResource($chat)], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Chat $chat): ChatResource
    {
        $chat->load([
            'users' => function ($builder) {
                $builder->whereNot('user_id', Auth::id())->limit(2);
            },
            'chatable',
        ])
            ->loadCount('users');

        return new ChatResource($chat);

    }

    public function users(Chat $chat): JsonResponse
    {
        return response()->json(['data' => $chat->users()->get()->map(fn ($u) => [
            'id' => $u->id,
            'name' => $u->name,
            'email' => $u->email,
            'avatar' => mediaUrl($u->getFirstMedia('avatar')),
        ])]);
    }

    public function present($id): Response
    {

        $chanelName = "chat.$id";
        $users = Cache::get($chanelName);
        if ($users == null) {
            $users = collect([]);
        }
        $users->push(request()->user()->id)->unique();

        Cache::set($chanelName, $users);

        return response()->noContent();
    }

    public function left($id): Response
    {
        $chanelName = "chat.$id";
        $users = Cache::get($chanelName);
        if ($users == null) {
            $users = collect([]);
        }
        $old = $users;
        $users = $users->reject(function ($item) {
            return $item === request()->user()->id;
        });
        Cache::set($chanelName, $users);

        return response()->noContent();
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateChatRequest $request, Chat $chat): JsonResponse
    {
        if ($request->has('title')) {
            $chat->update(['title' => $request->title]);
        }

        if ($request->has('user_ids')) {
            $userIds = collect($request->user_ids)->push(Auth::id())->unique();
            $chat->users()->sync($userIds->map(fn ($id) => ['user_id' => $id]));
        }

        $chat->load([
            'users' => fn ($q) => $q->whereNot('user_id', Auth::id()),
            'chatable',
        ])->loadCount('users');

        return response()->json(['data' => new ChatResource($chat)]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Chat $chat): Response
    {
        $chat->messages()->each(function ($message) {
            $message->messageReactions()->delete();
            $message->media()->each(fn ($m) => $m->delete());
            $message->delete();
        });
        $chat->users()->detach();

        if ($chat->chatable_type === Webhook::class) {
            Webhook::find($chat->chatable_id)?->delete();
        }

        $chat->delete();

        return response()->noContent();
    }
}
