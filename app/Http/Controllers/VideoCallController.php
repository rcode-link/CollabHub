<?php

namespace App\Http\Controllers;

use Agence104\LiveKit\AccessToken;
use Agence104\LiveKit\AccessTokenOptions;
use Agence104\LiveKit\VideoGrant;
use App\Events\ChatMessageCreated;
use App\Events\StartVideoCall;
use App\Helpers\Enums\ChatTypes;
use App\Models\Chat;
use App\Models\ChatMessage;
use App\Models\VideoCalls;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Sanctum\PersonalAccessToken;

class VideoCallController extends Controller
{
    public function startVideoCall(Request $request, $chat)
    {
        $chatData = Chat::with('users')->where('id', $chat)->first();

        $title = $chatData->title;
        if($chatData->type === ChatTypes::USER->value){
            $title =  $chatData->users->pluck('name')->join('-') . Carbon::now();
        }


        $chatMessage = ChatMessage::create([
            'user_id' => Auth::id(),
            'chat_id' => $chat
        ]);

        $chatMessage->videocalls()->create([
            'title' => $title ?? Str::random(15),
            'users' => $chatData->users->pluck('id')->toArray(),
            'slug' => Str::uuid()
        ]);
        $chatMessage->load('videocalls', 'user');
        foreach ($chatData->users->where(fn($obj) => $obj->id !== Auth::id())->all() as $user) {
            StartVideoCall::dispatch($user->id, $chatMessage);
        }

        ChatMessageCreated::dispatch($chatMessage);
        return response()->json($chatMessage->videocalls);
    }

    public function getVideoCallToken(Request $request, $id)
    {

        if ($request->header('authorization') && $request->header('authorization') != 'Bearer null') {
            $userToken = preg_replace('/Bearer |/', '', $request->header('authorization'));

            $user = PersonalAccessToken::findToken($userToken)->tokenable;
        } else {
            $user = $request->validate([
                'name' => ['required', 'string']
            ]);
            $user['id'] = Str::random(15);
        }


        $video = VideoCalls::whereSlug($id)->where('is_active', true)
            ->with('callable')
            ->firstOrFail();
        //
        abort_if(!$video->canIJoinVideoCall($request->get('currentTime'), $user), 500, "Call is not available");

        $tokenOptions = (new AccessTokenOptions())
            ->setIdentity($user['id'])
            ->setTtl(86400000)
            ->setName($user['name']);

        $videoGrant = (new VideoGrant())
            ->setRoomJoin(true)
            ->setRoomName($video->slug);


        $token = (new AccessToken(apiKey: config('livekit.key'), apiSecret: config('livekit.secret')))
            ->init($tokenOptions)
            ->setGrant($videoGrant)
            ->toJwt();

        return response()->json(['token' => $token]);
    }
}
