<?php

namespace App\Helpers;

class Authenticate
{
    public static function user()
    {
        $token = \Str::replace('Bearer ', '', request()->header('authorization'));
        $tokenData = \Laravel\Sanctum\PersonalAccessToken::findToken($token);

        return $tokenData->tokenable;
    }

    public static function id()
    {
        $token = \Str::replace('Bearer ', '', request()->header('authorization'));
        $tokenData = \Laravel\Sanctum\PersonalAccessToken::findToken($token);

        return $tokenData->tokenable->id;
    }

    public static function check()
    {
        $token = \Str::replace('Bearer ', '', request()->header('authorization'));
        $tokenData = \Laravel\Sanctum\PersonalAccessToken::findToken($token);

        abort_if(! $tokenData, 401, 'Unauthenticated.');
    }
}
