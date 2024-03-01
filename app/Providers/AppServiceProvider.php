<?php

namespace App\Providers;

use Dedoc\Scramble\Scramble;
use Dedoc\Scramble\Support\Generator\OpenApi;
use Dedoc\Scramble\Support\Generator\SecurityScheme;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Routing\Route;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {

        \Illuminate\Routing\Route::macro('subdomain', function ($uri, $action) {
            $domain = request()->getHost();
            $parts = explode('.', $domain);

            if (count($parts) > 2) {
                $subdomain = $parts[0];
                return $subdomain;
            }
            return null;
        });


        if (config('app.env') === 'production') {
            \URL::forceScheme('https');
        }

        Scramble::extendOpenApi(function (OpenApi $openApi) {
            $openApi->secure(
                SecurityScheme::http('bearer', 'JWT')
            );
        });

        Model::preventLazyLoading();
        //
    }
}
