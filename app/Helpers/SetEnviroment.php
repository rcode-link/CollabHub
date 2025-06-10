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
                    array(
                        'form_params' => array(
                            'subdomain' => $sitename,
                        )
                    )
                );
                throw_if($res->getStatusCode() !== 200, 'SOmeting whent wrong');
                return json_decode($res->getBody());
            } catch (\Exception $e) {
                \Log::error('error loading config', [
                    'subdomain' => $sitename,
                    'error' => $e->getCode()
                ]);
            }
        });
    }
    static function setup()
    {
        if (!config('app.license_provider') || app()->runningInConsole()) {
            return;
        }

        $domain = request()->getHost();
        $parts = explode('.', $domain);

        $subdomain = $parts[0];
        $model = SetEnviroment::loadEnv($subdomain);
        $fullDomain = \Str::replace('http://', 'https://', request()->getSchemeAndHttpHost());
        \Config::set('app.url', $fullDomain);
        \Config::set("filesystems.disks.public.url", $fullDomain . '/storage');
        SetEnviroment::connection($model);
    }

    static function connection($model)
    {
        if (!$model) {
            return;
        }

        \Cache::setPrefix($model->subdomain);
        \Config::set("app.name", $model->name . " | CollabHub");
        \Config::set("database.connections.mysql.database", "$model->database_name");
        \Config::set("database.connections.mysql.username", "$model->database_name");
        \Config::set("database.connections.mysql.password", "$model->database_password");
        \Config::set('broadcasting.connections.pusher.key', $model->soket->key);
        \Config::set('broadcasting.connections.pusher.secret', $model->soket->secret);
        \Config::set('broadcasting.connections.pusher.app_id', $model->soket->id);

        \Config::set('media-library.prefix', '/' . $model->subdomain);
        $frontendConfig = config('frontend');
        $frontendConfig['VITE_APP_NAME'] = $model->name;
        $frontendConfig['VITE_PUSHER_APP_KEY'] = $model->soket->key;;
        \Config::set("frontend", $frontendConfig);
        \DB::reconnect();
        try {
            \DB::connection()->getPdo();
        } catch (\Exception $e) {
            \Log::critical("db connection", [$model]);
        }
    }
}

