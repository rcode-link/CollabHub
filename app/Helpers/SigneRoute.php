<?php

namespace App\Helpers;

class SigneRoute
{
    static function make(string $name, array $params, ?string $expiration): string{
        $routeData = array_merge($params, ['expires' => $expiration]);
        $route = route($name, $routeData);
        $token = sha1(str_replace(config('app.url'), '', $route));
        $routeData['token'] = $token;
        return route($name, $routeData);
    }
}
