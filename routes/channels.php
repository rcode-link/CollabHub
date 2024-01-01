<?php

use App\Helpers\Socket\BroadcastCustom;
use App\Models\Chat;
use App\Models\User;

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

BroadcastCustom::getInstance()->channel('user.*', function (User $user, $companyId) {
    $isUserInCompany = $user->permissions()->pluck('permissions')->flatten()->contains('can-view-company.' . $companyId);

    if ($isUserInCompany) {
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


BroadcastCustom::getInstance()->channel('start-call.*', function (User $user, $chatId) {
    return true;
});

BroadcastCustom::getInstance()->channel('collaboration.*', function (User $user, $documentId) {
    return $user->toArray();
});

BroadcastCustom::getInstance()->channel('task-updated.task.*', function (User $user, $chatId) {
    return true;
});

BroadcastCustom::getInstance()->channel('task-updated.*', function (User $user, $project) {
    return $user->permissions()->pluck('permissions')->flatten()->contains("can-view-project.$project");
});

BroadcastCustom::getInstance()->channel('UpdateChatForUser.*', function (User $user, $userId) {
    return $user->id === (int)$userId;
});
