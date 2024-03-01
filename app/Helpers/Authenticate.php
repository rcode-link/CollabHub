<?php

namespace App\Helpers;

class Authenticate
{
    static function user()
    {
        $token = \Str::replace('Bearer ', '', request()->header('authorization'));
        $tokenData = \Laravel\Sanctum\PersonalAccessToken::findToken($token);

        return $tokenData->tokenable;
    }

    static function id()
    {
        $token = \Str::replace('Bearer ', '', request()->header('authorization'));
        $tokenData = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
        return $tokenData->tokenable->id;
    }

    static function check()
    {
        $token = \Str::replace('Bearer ', '', request()->header('authorization'));
        $tokenData = \Laravel\Sanctum\PersonalAccessToken::findToken($token);

        abort_if(!$tokenData, 401, 'Unauthenticated.');
    }
}
