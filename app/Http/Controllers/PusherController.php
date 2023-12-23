<?php

namespace App\Http\Controllers;

use App\Helpers\ChatPresentUsers;
use App\Helpers\Socket\BroadcastCustom;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Psy\Readline\Hoa\Console;
use Pusher\PusherException;

class PusherController extends Controller
{

    public function webhook(Request $request)
    {

        $event = $request->get('events');

        foreach ($event as $obj) {
            if (Str::contains($obj['channel'], 'presence')) {
                $chanelName = Str::replace('presence-', '', $obj['channel']);
                $users = Cache::get($chanelName);
                if ($users == null) {
                    $users = collect([]);
                }
                switch ($obj['name']) {
                    case 'member_added':
                        Cache::set($chanelName, $users->push($obj['user_id']));
                        break;
                    case 'member_removed':
                        Cache::set($chanelName, $users->reject(function ($item) use ($obj) {
                            return $item === $obj['user_id'];
                        }));
                        break;
                }

            }
        }
        return response()->json([
            'data' => 'ok'
        ]);
    }

}
