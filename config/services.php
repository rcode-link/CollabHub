<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
        'scheme' => 'https',
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'browsershot' => [
        'remote_host' => env('BROWSERSHOT_REMOTE_HOST'),
        'remote_port' => (int) env('BROWSERSHOT_REMOTE_PORT', 9222),
        'node_binary' => env('BROWSERSHOT_NODE_BINARY', 'node'),
        'npm_binary' => env('BROWSERSHOT_NPM_BINARY', 'npm'),
        'app_url' => env('BROWSERSHOT_APP_URL'),
    ],

];
