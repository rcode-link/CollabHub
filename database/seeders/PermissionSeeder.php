<?php

namespace Database\Seeders;

use App\Helpers\Enums\PermissionsScopes;
use App\Models\PermissionDefinition;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        $roles = collect([
            [
                'scope' => PermissionsScopes::Company->value,
                'name' => 'Can View company',
                'slug' => Str::slug('Can View company'),
            ],
            [
                'scope' => PermissionsScopes::Company->value,
                'name' => 'Can Update company',
                'slug' => Str::slug('Can Update company'),
            ],
            [
                'scope' => PermissionsScopes::Company->value,
                'name' => 'Can Delete company',
                'slug' => Str::slug('Can Delete company'),
            ],
            [
                'scope' => PermissionsScopes::Company->value,
                'name' => 'Can Create project',
                'slug' => Str::slug('Can Create project'),
            ],
            [
                'scope' => PermissionsScopes::Company->value,
                'name' => 'Can Manage Roles',
                'slug' => Str::slug('Can Manage Roles'),
            ],
            [
                'scope' => PermissionsScopes::Company->value,
                'name' => 'Can view billing info',
                'slug' => Str::slug('can-view-billing-info'),
            ],
            [
                'scope' => PermissionsScopes::Company->value,
                'name' => 'Can manage customer companies',
                'slug' => Str::slug('Can manage customer companies'),
            ],
            [
                'scope' => PermissionsScopes::Company->value,
                'name' => 'Can create invoice',
                'slug' => Str::slug('Can create invoice'),
            ],
            [
                'scope' => PermissionsScopes::Project->value,
                'name' => 'Can View project',
                'slug' => Str::slug('Can View project'),
            ],
            [
                'scope' => PermissionsScopes::Project->value,
                'name' => 'Can Update project',
                'slug' => Str::slug('Can Update project'),
            ],
            [
                'scope' => PermissionsScopes::Project->value,
                'name' => 'Can Delete project',
                'slug' => Str::slug('Can Delete project'),
            ],
            [
                'scope' => PermissionsScopes::Project->value,
                'name' => 'Can see time sheet for all users',
                'slug' => Str::slug('can-see-all-time-sheet'),
            ],
            [
                'scope' => PermissionsScopes::Project->value,
                'name' => 'Can create document',
                'slug' => Str::slug('Can create document'),
            ],
            [
                'scope' => PermissionsScopes::Project->value,
                'name' => 'Can update document',
                'slug' => Str::slug('Can update document'),
            ],
            [
                'scope' => PermissionsScopes::Project->value,
                'name' => 'Can create task',
                'slug' => Str::slug('Can create task'),
            ],
            [
                'scope' => PermissionsScopes::Project->value,
                'name' => 'Can create board',
                'slug' => Str::slug('Can create board'),
            ],
            [
                'scope' => PermissionsScopes::Project->value,
                'name' => 'Can update board',
                'slug' => Str::slug('Can update board'),
            ],
            [
                'scope' => PermissionsScopes::Project->value,
                'name' => 'Can add task to board',
                'slug' => Str::slug('Can add task to board'),
            ],
            [
                'scope' => PermissionsScopes::Project->value,
                'name' => 'Can delete document',
                'slug' => Str::slug('Can delete document'),
            ],
            [
                'scope' => PermissionsScopes::Company->value,
                'name' => 'Can Invite Users',
                'slug' => Str::slug('Can Invite Users'),
            ],
            [
                'scope' => PermissionsScopes::Company->value,
                'name' => 'Can Deactivate Users',
                'slug' => Str::slug('Can Deactivate Users'),
            ],
            [
                'scope' => PermissionsScopes::Company->value,
                'name' => 'Can Delete Users',
                'slug' => Str::slug('Can Delete Users'),
            ],
            [
                'scope' => PermissionsScopes::Company->value,
                'name' => 'Can View Users',
                'slug' => Str::slug('Can View Users'),
            ],
            [
                'scope' => PermissionsScopes::Company->value,
                'name' => 'Can View Users',
                'slug' => Str::slug('Can View Users'),
            ],
            [
                'scope' => PermissionsScopes::Company->value,
                'name' => 'Can Approve Vacation',
                'slug' => Str::slug('Can Approve Vacation'),
            ],
        ]);

        PermissionDefinition::insert($roles->whereNotIn('slug', PermissionDefinition::pluck('slug'))->toArray());


    }
}
