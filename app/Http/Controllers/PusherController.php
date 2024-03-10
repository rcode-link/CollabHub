<?php

namespace App\Http\Controllers;

use App\Helpers\ChatPresentUsers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PusherController extends Controller
{

    public function webhook(Request $request)
    {

        $event = $request->get('events');
        \Log::info('webhook event', $event);
        foreach ($event as $obj) {
            if (Str::contains($obj['channel'], 'presence')) {
                $chanelName = Str::replace('presence-', '', $obj['channel']);
                $users = Cache::get($chanelName);
                if ($users == null) {
                    $users = collect([]);
                }
                switch ($obj['name']) {
                    case 'member_added':
                        $users->push($obj['user_id']);
                        break;
                    case 'member_removed':
                        $users = $users->reject(function ($item) use ($obj) {
                            return $item === $obj['user_id'];
                        });
                        break;
                }

                Cache::set($chanelName, $users);

            }
        }
        return response()->json([
            'data' => 'ok'
        ]);
    }

}
