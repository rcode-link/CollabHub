<?php

namespace App\Http\Controllers;

use Agence104\LiveKit\AccessToken;
use Agence104\LiveKit\AccessTokenOptions;
use Agence104\LiveKit\VideoGrant;
use App\Events\ChatMessageCreated;
use App\Events\StartVideoCall;
use App\Events\VideoCallJoinApproved;
use App\Events\VideoCallJoinDenied;
use App\Events\VideoCallJoinRequest;
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

        $title = $chatData->type === ChatTypes::USER->value ? $chatData->users->pluck('name')->join('-').Carbon::now() : $chatData->title;

        $chatMessage = ChatMessage::create([
            'user_id' => Auth::id(),
            'chat_id' => $chat,
        ]);

        $chatMessage->videocalls()->create([
            'title' => $title ?? Str::random(15),
            'users' => $chatData->users->pluck('id')->toArray(),
            'slug' => Str::uuid(),
        ]);
        $chatMessage->load('videocalls', 'user');
        foreach ($chatData->users->where(fn ($obj) => $obj->id !== Auth::id())->all() as $user) {
            StartVideoCall::dispatch($user->id, $chatMessage);
        }

        ChatMessageCreated::dispatch($chatMessage);

        return response()->json($chatMessage->videocalls);
    }

    public function getVideoCallToken(Request $request, $id)
    {
        $user = $this->resolveUser($request);

        $video = VideoCalls::whereSlug($id)->where('is_active', true)
            ->with('callable')
            ->firstOrFail();

        abort_if(! $video->canIJoinVideoCall($request->get('currentTime'), $user), 500, 'Call is not available');

        // Invited users get a token immediately
        if (in_array($user['id'], $video->users ?? [])) {
            return response()->json(['token' => $this->generateToken($user, $video)]);
        }

        // Non-invited users must go through the waiting room
        $existing = $video->joinRequests()
            ->where(function ($q) use ($user) {
                if (is_numeric($user['id'])) {
                    $q->where('user_id', $user['id']);
                } else {
                    $q->where('name', $user['name'])->whereNull('user_id');
                }
            })
            ->whereIn('status', ['pending', 'approved'])
            ->first();

        // If there's an approved request, issue the token
        if ($existing && $existing->status === 'approved') {
            return response()->json(['token' => $this->generateToken($user, $video)]);
        }

        // If already pending, return the same request
        if ($existing && $existing->status === 'pending') {
            return response()->json(['status' => 'pending', 'request_id' => $existing->id], 202);
        }

        // Create a new pending request
        $joinRequest = $video->joinRequests()->create([
            'name' => $user['name'],
            'user_id' => is_numeric($user['id']) ? $user['id'] : null,
            'status' => 'pending',
        ]);

        VideoCallJoinRequest::dispatch($video->slug, $joinRequest);

        return response()->json(['status' => 'pending', 'request_id' => $joinRequest->id], 202);
    }

    public function createJoinRequest(Request $request, $slug)
    {
        $user = $this->resolveUser($request);

        $video = VideoCalls::whereSlug($slug)->where('is_active', true)->firstOrFail();

        $existing = $video->joinRequests()
            ->where(function ($q) use ($user) {
                if (is_numeric($user['id'])) {
                    $q->where('user_id', $user['id']);
                } else {
                    $q->where('name', $user['name'])->whereNull('user_id');
                }
            })
            ->whereIn('status', ['pending', 'approved'])
            ->first();

        if ($existing) {
            return response()->json([
                'status' => $existing->status,
                'request_id' => $existing->id,
            ], $existing->status === 'approved' ? 200 : 202);
        }

        $joinRequest = $video->joinRequests()->create([
            'name' => $user['name'],
            'user_id' => is_numeric($user['id']) ? $user['id'] : null,
            'status' => 'pending',
        ]);

        VideoCallJoinRequest::dispatch($video->slug, $joinRequest);

        return response()->json(['status' => 'pending', 'request_id' => $joinRequest->id], 202);
    }

    public function getRequestStatus($slug, $id)
    {
        $video = VideoCalls::whereSlug($slug)->where('is_active', true)->firstOrFail();
        $joinRequest = $video->joinRequests()->findOrFail($id);

        $data = [
            'status' => $joinRequest->status,
            'request_id' => $joinRequest->id,
        ];

        if ($joinRequest->status === 'approved') {
            $user = [
                'id' => $joinRequest->user_id ?? Str::random(15),
                'name' => $joinRequest->name,
            ];
            $data['token'] = $this->generateToken($user, $video);
        }

        return response()->json($data);
    }

    public function listPendingRequests($slug)
    {
        $video = VideoCalls::whereSlug($slug)->where('is_active', true)->firstOrFail();

        $requests = $video->joinRequests()
            ->where('status', 'pending')
            ->orderBy('created_at')
            ->get(['id', 'name', 'user_id', 'status', 'created_at']);

        return response()->json($requests);
    }

    public function approveRequest($slug, $id)
    {
        $video = VideoCalls::whereSlug($slug)->where('is_active', true)->firstOrFail();
        $joinRequest = $video->joinRequests()->where('status', 'pending')->findOrFail($id);

        $joinRequest->update(['status' => 'approved']);

        VideoCallJoinApproved::dispatch($joinRequest);

        return response()->json(['status' => 'approved']);
    }

    public function denyRequest($slug, $id)
    {
        $video = VideoCalls::whereSlug($slug)->where('is_active', true)->firstOrFail();
        $joinRequest = $video->joinRequests()->where('status', 'pending')->findOrFail($id);

        $joinRequest->update(['status' => 'denied']);

        VideoCallJoinDenied::dispatch($joinRequest);

        return response()->json(['status' => 'denied']);
    }

    private function resolveUser(Request $request): array
    {
        if ($request->header('authorization') && $request->header('authorization') != 'Bearer null') {
            $userToken = preg_replace('/Bearer |/', '', $request->header('authorization'));
            $tokenModel = PersonalAccessToken::findToken($userToken);

            if ($tokenModel) {
                $user = $tokenModel->tokenable;

                return ['id' => $user->id, 'name' => $user->name];
            }
        }

        $validated = $request->validate([
            'name' => ['required', 'string'],
        ]);

        return ['id' => Str::random(15), 'name' => $validated['name']];
    }

    private function generateToken(array $user, VideoCalls $video): string
    {
        $tokenOptions = (new AccessTokenOptions)
            ->setIdentity((string) $user['id'])
            ->setTtl(86400000)
            ->setName($user['name']);

        $videoGrant = (new VideoGrant)
            ->setRoomJoin(true)
            ->setRoomName($video->slug);

        return (new AccessToken(apiKey: config('livekit.key'), apiSecret: config('livekit.secret')))
            ->init($tokenOptions)
            ->setGrant($videoGrant)
            ->toJwt();
    }
}
