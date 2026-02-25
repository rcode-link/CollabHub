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
        'Soketi' => "soketi start --config='./soketi.config.example.js'",
        'CroneJob' => 'php artisan queue:work',
        'SeaweedFS' => sprintf(
            'weed mini -dir=%s -master.port=%s -volume.port=%s -filer.port=%s -s3.port=%s -s3.config=%s',
            $seaweedDir,
            env('SEAWEEDFS_MASTER_PORT', '9333'),
            env('SEAWEEDFS_VOLUME_PORT', '8080'),
            env('SEAWEEDFS_FILER_PORT', '8888'),
            env('SEAWEEDFS_S3_PORT', '8333'),
            $s3ConfigPath,
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
