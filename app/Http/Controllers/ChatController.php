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
            ->select('chats.*')
            ->addSelect(['muted_until' => \DB::table('chat_user')
                ->select('muted_until')
                ->whereColumn('chat_id', 'chats.id')
                ->where('user_id', Auth::id())
                ->limit(1),
            ])
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

        $users = collect($request->get('user_id'))->push(Auth::id())->map(fn ($id) => (int) $id)->unique()->values();

        // Untitled 1-on-1 chats are direct messages — reuse the existing one instead of creating a duplicate
        if ($users->count() === 2 && blank($data['title'] ?? null)) {
            $existing = Chat::query()
                ->where('chatable_type', User::class)
                ->where(fn ($q) => $q->whereNull('title')->orWhere('title', ''))
                ->whereHas('users', fn ($q) => $q->where('users.id', $users[0]))
                ->whereHas('users', fn ($q) => $q->where('users.id', $users[1]))
                ->has('users', '=', 2)
                ->first();

            if ($existing) {
                $existing->load('users');
                $existing->loadCount('users');

                return response()->json(['data' => new ChatResource($existing)], 200);
            }
        }

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

        $chat->setAttribute('muted_until', \DB::table('chat_user')
            ->where('chat_id', $chat->id)
            ->where('user_id', Auth::id())
            ->value('muted_until'));

        return new ChatResource($chat);

    }

    /**
     * Chat IDs the authenticated user has muted. Loaded once at app init so
     * in-app toasts/sounds can be suppressed on any page.
     */
    public function mutedChats(): JsonResponse
    {
        return response()->json([
            'data' => \DB::table('chat_user')
                ->where('user_id', Auth::id())
                ->where('muted_until', '>', now())
                ->pluck('chat_id'),
        ]);
    }

    /**
     * Mute a chat for the authenticated user. Optional `minutes` for a
     * temporary mute; without it the chat is muted indefinitely.
     */
    public function mute(Request $request, Chat $chat): JsonResponse
    {
        abort_unless($chat->users()->where('user_id', Auth::id())->exists(), 403);

        $request->validate(['minutes' => ['sometimes', 'integer', 'min:1']]);

        $mutedUntil = $request->filled('minutes')
            ? now()->addMinutes((int) $request->get('minutes'))
            : \Carbon\Carbon::create(9999);

        $chat->users()->updateExistingPivot(Auth::id(), ['muted_until' => $mutedUntil]);

        return response()->json(['muted' => true, 'muted_until' => $mutedUntil]);
    }

    public function unmute(Chat $chat): JsonResponse
    {
        $chat->users()->updateExistingPivot(Auth::id(), ['muted_until' => null]);

        return response()->json(['muted' => false]);
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
