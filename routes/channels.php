<?php

use App\Helpers\Socket\BroadcastCustom;
use App\Models\Chat;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

BroadcastCustom::getInstance()->channel('user.*', function ($user, $companyId) {
    $isUserInCompany = \App\Models\Company::query()->where('id', $companyId)
        ->whereHas('users', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->count();

    if ($isUserInCompany > 0) {
        return ['id' => $user->id];
    }
});

BroadcastCustom::getInstance()->channel('chat.*', function ($user, $chatId) {
    $data = Chat::query()
        ->where('id', $chatId)
        ->whereHas('users', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->count();

    if ($data > 0) {
        return ['id' => $user->id];
    }
});


BroadcastCustom::getInstance()->channel('start-call.*', function ($user, $chatId) {
    return true;
});

BroadcastCustom::getInstance()->channel('collaboration.*', function ($user, $documentId) {
    return $user->toArray();
});

BroadcastCustom::getInstance()->channel('task-updated.task.*', function ($user, $chatId) {
    return true;
});

BroadcastCustom::getInstance()->channel('task-updated.*', function ($user, $project) {
    return $user->permissions()->where('permission', "can-view-project.$project")->count();
});

BroadcastCustom::getInstance()->channel('UpdateChatForUser.*', function ($user, $userId) {
    return $user->id === (int)$userId;
});
