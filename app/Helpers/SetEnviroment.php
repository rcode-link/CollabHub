<?php

namespace App\Helpers;

use GuzzleHttp\Client;

class SetEnviroment
{
    static function loadEnv($sitename)
    {
        return cache()->remember($sitename, 8 * 60 * 60, function () use ($sitename) {
            $client = new Client();
            try {

                $res = $client->post(
                    config('app.license_provider') . "/api/settings?token=" . config('app.license_token'),
                    array (
                        'form_params' => array (
                            'subdomain' => $sitename,
                        )
                    )
                );
                \Log::info("send it", [
                    'subdomain' => $sitename,

                ]);
                throw_if($res->getStatusCode() !== 200, 'SOmeting whent wrong');
                return json_decode($res->getBody());
            } catch (\Exception $e) {
                \Log::info('error loading config', [
                    'subdomain' => $sitename,
                    'error' => $e->getCode()
                ]);
            }

        });
    }
    static function setup()
    {
        if (!config('app.license_provider')) {
            return;
        }

        $domain = request()->getHost();
        $parts = explode('.', $domain);

        $subdomain = $parts[0];
        $model = SetEnviroment::loadEnv($subdomain);
        \Config::set('app.url', request()->root());
        SetEnviroment::connection($model);
    }

    static function connection($model)
    {
        \Log::info("model data", $model);
        \Cache::setPrefix($model->subdomain);
        \Config::set("app.name", $model->name . " | CollabHub");
        \Config::set("database.connections.mysql.database", $model->database_name);
        \Config::set("database.connections.mysql.username", $model->database_name);
        \Config::set("database.connections.mysql.password", $model->database_password);
        \Config::set("frontend", [
            'VITE_APP_NAME' => $model->name,
            'VITE_PUSHER_APP_KEY' => $model->soket->key,
            'VITE_PUSHER_HOST' => env('VITE_PUSHER_HOST', null),
            'VITE_PUSHER_PORT' => env('VITE_PUSHER_PORT', null),
            'VITE_PUSHER_SCHEME' => env('VITE_PUSHER_SCHEME', null),
            'VITE_PUSHER_APP_CLUSTER' => env('VITE_PUSHER_APP_CLUSTER', null),
            'VITE_LIVEKIT_URL' => env('VITE_LIVEKIT_URL', null),
        ]);

        \DB::reconnect();
    }
}