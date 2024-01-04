<?php

namespace App\Http\Controllers;

use Agence104\LiveKit\AccessToken;
use Agence104\LiveKit\AccessTokenOptions;
use Agence104\LiveKit\VideoGrant;
use App\Events\ChatMessageCreated;
use App\Events\ChatMessageDeleted;
use App\Events\StartVideoCall;
use App\Helpers\Enums\ChatTypes;
use App\Http\Requests\ChatMessageCreateRequest;
use App\Http\Requests\StoreChatRequest;
use App\Http\Requests\UpdateChatRequest;
use App\Http\Resources\ChatMessageResource;
use App\Http\Resources\ChatResource;
use App\Models\Chat;
use App\Models\ChatMessage;
use App\Models\MessageReaction;
use App\Models\User;
use App\Models\VideoCalls;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;


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
            ])
            ->loadCount('users');
        return new ChatResource($chat);

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
