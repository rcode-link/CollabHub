<?php

namespace App\Policies;

use App\Helpers\Enums\PermissionsStates;
use App\Models\Company;
use App\Models\User;

class CompanyPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        //
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Company $company): bool
    {
        return $user->isAdmin() || $user->hasPermission($company, PermissionsStates::Read->value);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->isAdmin() ||  $user->hasPermission(Company::class, PermissionsStates::Create->value);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Company $company): bool
    {
        return $user->isAdmin() ||  $user->hasPermission($company, PermissionsStates::Update->value);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Company $company): bool
    {
        return $user->isAdmin() ||  $user->hasPermission($company, PermissionsStates::Delete->value);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Company $company): bool
    {
        return $user->isAdmin() ||  $user->hasPermission($company, PermissionsStates::Delete->value);
        //
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Company $company): bool
    {
        return $user->isAdmin() ||  $user->hasPermission($company, PermissionsStates::Delete->value);
    }
}
