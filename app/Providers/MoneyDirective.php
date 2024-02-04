<?php

namespace App\Providers;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\ServiceProvider;
use Money\Money;
use Money\Currency;

class MoneyDirective extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        Blade::directive('money', function ($arguments) {
            // list($param1) = explode(',', $arguments);
            // dd($param1);
            // Process the parameters here
            return "echo 'your value was' . $arguments";
            ;
        });
        //
    }
}
