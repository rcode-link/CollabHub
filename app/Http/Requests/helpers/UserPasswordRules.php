<?php

namespace App\Http\Requests\helpers;

class UserPasswordRules
{
    public static array $BASE_RULES = [
        'required',
        'string',
        'min:8',
        'regex:/[A-Z]/',
        'regex:/[0-9]/',
        'regex:/[@$!%*#?_&]/',
    ];

    public static array $CONFIRMED = ['confirmed'];

    public static function WITH_CONFIRMED(): array
    {
        return array_merge(UserPasswordRules::$BASE_RULES, UserPasswordRules::$CONFIRMED);
    }
}
