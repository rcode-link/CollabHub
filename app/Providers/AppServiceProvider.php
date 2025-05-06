<?php

namespace App\Providers;

use App\Helpers\SetEnviroment;
use Dedoc\Scramble\Scramble;
use Dedoc\Scramble\Support\Generator\OpenApi;
use Dedoc\Scramble\Support\Generator\SecurityScheme;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\ServiceProvider;

use App\Service\ServiceInterface;
use App\Service\TimeSheetService;

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

        SetEnviroment::setup();

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
            \URL::forceRootUrl(request()->root());
        }

        Scramble::extendOpenApi(function (OpenApi $openApi) {
            $openApi->secure(
                SecurityScheme::http('bearer', 'JWT')
            );
        });
        $this->app->bind(ServiceInterface::class, function () {
            return new TimeSheetService();
        });

        Model::preventLazyLoading();
        //
    }
}
