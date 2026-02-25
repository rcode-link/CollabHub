<?php

namespace App\Events;

use App\Models\Company;
use App\Models\File;
use App\Models\PermissionDefinition;
use App\Models\Project;
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

        $documentPermissionMap = [
            'can-view-project' => 'can-read-document',
            'can-update-document' => 'can-update-document',
            'can-delete-document' => 'can-delete-document',
        ];

        $projectFileIds = [];

        foreach ($data as $role) {
            if ($role->resourcable === null) {
                continue;
            }
            $roleType = $role->resourcable_type === Company::class ? \App\Helpers\Enums\PermissionsScopes::Company->value : \App\Helpers\Enums\PermissionsScopes::Project->value;

            $projectPermissions = $role->role->definitions
                ->where(fn (PermissionDefinition $permissionDefinition) => $permissionDefinition->scope == $roleType)
                ->map(fn (PermissionDefinition $permissionDefinition) => $permissionDefinition->slug.'.'.$role->resourcable_id);

            $perDocumentPermissions = collect([]);

            if ($role->resourcable_type === Project::class) {
                $projectId = $role->resourcable_id;

                if (! isset($projectFileIds[$projectId])) {
                    $projectFileIds[$projectId] = File::where('entity_type', Project::class)
                        ->where('entity_id', $projectId)
                        ->pluck('id');
                }

                $slugs = $role->role->definitions
                    ->where(fn (PermissionDefinition $pd) => $pd->scope == $roleType)
                    ->pluck('slug');

                foreach ($slugs as $slug) {
                    if (isset($documentPermissionMap[$slug])) {
                        $docSlug = $documentPermissionMap[$slug];
                        foreach ($projectFileIds[$projectId] as $fileId) {
                            $perDocumentPermissions->push("{$docSlug}.{$fileId}");
                        }
                    }
                }
            }

            $permissions->push([
                'permissions' => $projectPermissions->merge($perDocumentPermissions),
                'users' => $role->role->users->pluck('id'),
                'model' => array_merge($role->resourcable->toArray(), [
                    'type' => $role->resourcable_type,
                ]),
            ]);
        }

        Cache::add('permissions', $permissions);
    }
}
