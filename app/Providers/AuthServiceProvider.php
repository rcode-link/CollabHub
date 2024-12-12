<?php

namespace App\Providers;

// use Illuminate\Support\Facades\Gate;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        //
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {

        Gate::define('check-permission',
            function (User $user, Model|int $model, string $gate) {

                $permissions = $user->permissions()->pluck('permissions')->flatten();
                if (gettype($model) === 'object') {
                    return $permissions->contains("$gate.$model->id");
                }

                return $permissions->contains("$gate.$model");
            });
    }
}
