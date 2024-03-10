<?php

namespace App\Http\Controllers;

use App\Helpers\Enums\ChatTypes;
use App\Http\Requests\StoreChatRequest;
use App\Http\Requests\UpdateChatRequest;
use App\Http\Resources\ChatResource;
use App\Models\Chat;
use App\Models\ChatMessage;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class ChatController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
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
                $query->whereNot('chatable_type', User::class);
            })
            ->orderByDesc(ChatMessage::query()->select('created_at')->whereColumn('chat_messages.chat_id', 'chats.id')->orderByDesc('created_at')->limit(1));

        return ChatResource::collection($chat->paginate());
    }


    public function getNumberOfUnreadMessages(Request $request)
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
            'total' => $numberOfUnreadMessage->sum('number_of_unread_messages_count')
        ]);
    }

    /**
     * Create new chat
     */
    public function store(StoreChatRequest $request)
    {
        $data = $request->only('title');
        $data['chatable_type'] = User::class;
        $data['chatable_id'] = Auth::id();

        $users = collect($request->get('user_id'))->push(Auth::id());

        $chat = Chat::create($data);

        $chat->users()->sync($users->map(function ($str) {
            return [
                'user_id' => $str
            ];
        }));

        return response()->noContent();
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Chat $chat)
    {
        $chat->load([
            'users' => function ($builder) {
                $builder->whereNot('user_id', Auth::id())->limit(2);
            },
            'chatable'
        ])
            ->loadCount('users');
        return new ChatResource($chat);

    }

    public function present($id)
    {

        $chanelName = "chat.$id";
        $users = Cache::get($chanelName);
        if ($users == null) {
            $users = collect([]);
        }
        $users->push(request()->user()->id)->unique();

        Cache::set($chanelName, $users);

        return $users;
    }


    public function left($id)
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

        return response()->json([
            'users' => $users,
            'old' => $old
        ]);
    }



    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateChatRequest $request, Chat $chat)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Chat $chat)
    {
        //
    }
}
