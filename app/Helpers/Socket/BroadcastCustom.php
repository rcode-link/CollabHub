<?php

namespace App\Helpers\Socket;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Pusher\Pusher;
use Pusher\PusherException;

class BroadcastCustom
{
    private static array $channels = [];

    private static string $lastChannelName = '';
    private static $_instance = null;

    public static function getInstance()
    {
        if (self::$_instance === null) {
            self::$_instance = new self;
        }

        return self::$_instance;
    }

    public function channel(string $chanelName, $callback): static
    {

        self::$lastChannelName = $chanelName;
        $chanelInfo = new ChanelInfo();
        $chanelInfo->chanelName = $chanelName;
        $chanelInfo->chanelNameRegex = preg_replace("(\*|{\w+})", "(\w+)", $chanelName);
        $chanelInfo->callbackFunction = $callback;
        $chanelInfo->middleware = [];
        self::$channels[$chanelName] = $chanelInfo;
        return $this;
    }

    /**
     * Its now working currently
     * @param array $middleware
     * @return $this
     */
    public function middleware(array $middleware): static
    {
        self::$channels[self::$lastChannelName]->middleware = $middleware;

        return $this;
    }


    public function check(Request $request)
    {
        $socket_id = $request->get('socket_id');
        $user = $request->user();

        $chanelData = $this->parseChanel($request->get('channel_name'));

        $chanel = array_filter(self::$channels, function ($obj) use ($chanelData) {
            return preg_match('/' . $obj->chanelNameRegex . '/', $chanelData->chanelName);
        });

        abort_if(!count($chanel), Response::HTTP_FORBIDDEN);

        $chanel = $chanel[array_key_first($chanel)];

        preg_match_all('/' . $chanel->chanelNameRegex . '/', $chanelData->chanelName, $matches);


        $funDataWithChanelName = array_filter(Arr::flatten($matches), function ($str) use ($chanelData) {
            return $str !== $chanelData->chanelName;
        });
        try {
            $pusher = new Pusher(auth_key: config('broadcasting.connections.pusher.key'), secret: config('broadcasting.connections.pusher.secret'), app_id: config('broadcasting.connections.pusher.app_id'));
        } catch (PusherException $e) {
            Log::error('Pusher', $e);
        }

//       Middleware check is not working
//        abort_if(count($chanel->middleware) > 0 && !Auth::check($chanel->middleware), Response::HTTP_FORBIDDEN);
//

        $isUserAuthorized = call_user_func_array($chanel->callbackFunction, array_merge([$user], $funDataWithChanelName));

        if ($chanelData->chanelType === 'private' && $isUserAuthorized) {
            return $pusher->authorizeChannel($request->get('channel_name'), $socket_id);
        }

        if ($chanelData->chanelType === 'presence' && gettype($isUserAuthorized) === 'array') {
            return $pusher->authorizePresenceChannel($request->get('channel_name'), $socket_id, $user->id, $isUserAuthorized);
        }

        abort(Response::HTTP_FORBIDDEN);
    }

    private function parseChanel($channel_name): ChanelInfo
    {

        $channelInfo = new ChanelInfo();

        $channelInfo->chanelType = Str::contains($channel_name, 'private') ? 'private' : 'presence';
        $channelInfo->chanelName = Str::replace($channelInfo->chanelType . '-', '', $channel_name);
        return $channelInfo;
    }

    public function logData()
    {
        return self::$channels;
    }


    static function route(): void
    {
        Route::post('/pusher/auth', function (Request $request) {
            return BroadcastCustom::getInstance()->check($request);
        });
    }

}


