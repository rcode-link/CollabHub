<?php

use SoloTerm\Solo\Commands\Command;
use SoloTerm\Solo\Commands\EnhancedTailCommand;
use SoloTerm\Solo\Hotkeys;
use SoloTerm\Solo\Themes;

// Solo may not (should not!) exist in prod, so we have to
// check here first to see if it's installed.
if (! class_exists('\SoloTerm\Solo\Manager')) {
    return [
        //
    ];
}

// Generate the SeaweedFS S3 credentials config from .env so that
// the same keys used by Laravel's S3 driver also work in SeaweedFS.
$seaweedDir = storage_path('seaweedfs');
$s3ConfigPath = $seaweedDir.'/s3.json';

if (! is_dir($seaweedDir)) {
    mkdir($seaweedDir, 0755, true);
}

file_put_contents($s3ConfigPath, json_encode([
    'identities' => [
        [
            'name' => 'admin',
            'credentials' => [
                [
                    'accessKey' => env('AWS_ACCESS_KEY_ID'),
                    'secretKey' => env('AWS_SECRET_ACCESS_KEY'),
                ],
            ],
            'actions' => ['Admin'],
        ],
    ],
], JSON_PRETTY_PRINT));

return [
    /*
    |--------------------------------------------------------------------------
    | Themes
    |--------------------------------------------------------------------------
    */
    'theme' => env('SOLO_THEME', 'dark'),

    'themes' => [
        'light' => Themes\LightTheme::class,
        'dark' => Themes\DarkTheme::class,
    ],

    /*
    |--------------------------------------------------------------------------
    | Keybindings
    |--------------------------------------------------------------------------
    */
    'keybinding' => env('SOLO_KEYBINDING', 'vim'),

    'keybindings' => [
        'default' => Hotkeys\DefaultHotkeys::class,
        'vim' => Hotkeys\VimHotkeys::class,
    ],

    /*
    |--------------------------------------------------------------------------
    | Commands
    |--------------------------------------------------------------------------
    |
    */
    'commands' => [
        'About' => 'php artisan solo:about',
        'Logs' => EnhancedTailCommand::file(storage_path('logs/laravel.log')),
        'Vite' => 'npm run dev',
        'Soketi' => sprintf(
            'docker run --rm --name soketi -p %s:6001 -p 9601:9601 '
            .'-e SOKETI_DEBUG=1 -e SOKETI_DEFAULT_APP_ID=%s '
            .'-e SOKETI_DEFAULT_APP_KEY=%s -e SOKETI_DEFAULT_APP_SECRET=%s '
            .'quay.io/soketi/soketi:latest-16-alpine',
            env('PUSHER_PORT', '6001'),
            env('PUSHER_APP_ID', 'app-id'),
            env('PUSHER_APP_KEY', 'app-key'),
            env('PUSHER_APP_SECRET', 'app-secret'),
        ),
        'CroneJob' => 'php artisan queue:work',
        'Collab' => sprintf(
            'cd collaboration-server && NODE_TLS_REJECT_UNAUTHORIZED=0 LARAVEL_URL=%s COLLAB_SECRET=%s COLLAB_PORT=%s npm run dev',
            env('COLLAB_LARAVEL_URL', env('APP_URL', 'http://localhost')),
            env('COLLAB_SECRET', 'collab-secret'),
            env('COLLAB_PORT', '6002'),
        ),
        'SeaweedFS' => sprintf(
            'docker run --rm --name collabhub-seaweedfs '
            .'-p %s:9333 -p %s:8080 -p %s:8888 -p %s:8333 '
            .'-v %s:/data '
            .'chrislusf/seaweedfs:latest server '
            .'-dir=/data -s3 -s3.config=/data/s3.json -master.volumeSizeLimitMB=1024',
            env('SEAWEEDFS_MASTER_PORT', '9333'),
            env('SEAWEEDFS_VOLUME_PORT', '8080'),
            env('SEAWEEDFS_FILER_PORT', '8888'),
            env('SEAWEEDFS_S3_PORT', '8333'),
            $seaweedDir,
        ),
    ],

    /*
    |--------------------------------------------------------------------------
    | Miscellaneous
    |--------------------------------------------------------------------------
    */

    /*
     * If you run the solo:dumps command, Solo will start a server to receive
     * the dumps. This is the address. You probably don't need to change
     * this unless the default is already taken for some reason.
     */
    'dump_server_host' => env('SOLO_DUMP_SERVER_HOST', 'tcp://127.0.0.1:9984'),
];
