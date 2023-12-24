<?php

namespace App\Events;

use App\Models\Company;
use App\Models\PermissionDefinition;
use App\Models\RoleResource;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Support\Facades\Cache;

class ManagePermissionsEvent
{
    use Dispatchable;

    /**
     * Create a new event instance.
     */
    public function __construct()
    {
        Cache::forget('permissions');
        $data = RoleResource::with('role', 'role.users', 'role.definitions', 'resourcable')->get();

        $permissions = collect([]);

        foreach ($data as $role) {
            $roleType = $role->resourcable_type === Company::class ? \App\Helpers\Enums\PermissionsScopes::Company->value : \App\Helpers\Enums\PermissionsScopes::Project->value;
            $permissions->push([
                'permissions' => $role->role->definitions
                    ->where(fn(PermissionDefinition $permissionDefinition) => $permissionDefinition->scope == $roleType)
                    ->map(fn(PermissionDefinition $permissionDefinition) => $permissionDefinition->slug . '.' . $role->resourcable_id),
                'users' => $role->role->users->pluck('id'),
                'model' => array_merge($role->resourcable->toArray(), [
                    'type' => $role->resourcable_type
                ])
            ]);
        }

        Cache::add('permissions', $permissions);
    }

}
