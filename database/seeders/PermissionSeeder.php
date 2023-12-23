<?php

namespace Database\Seeders;

use App\Helpers\Enums\PermissionsScopes;
use App\Models\PermissionDefinition;
use App\Models\PermissionGroup;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $companyGr = PermissionGroup::create([
            'name' => 'company'
        ]);
        $projectGr = PermissionGroup::create([
                'name' => 'Project',
                'parent_id' => $companyGr->id
        ]);
        $usersGr = PermissionGroup::create([
            'name' => 'Users',
            'parent_id' => $companyGr->id
        ]);

        PermissionDefinition::insert([
            [
                'scope' => PermissionsScopes::Company->value,
                'name' => 'Can View company',
                'slug' => Str::slug('Can View company'),
                'group_id' => $companyGr->id
            ],
            [
                'scope' => PermissionsScopes::Company->value,
                'name' => 'Can Update company',
                'slug' => Str::slug('Can Update company'),
                'group_id' => $companyGr->id
            ],
            [
                'scope' => PermissionsScopes::Company->value,
                'name' => 'Can Delete company',
                'slug' => Str::slug('Can Delete company'),
                'group_id' => $companyGr->id
            ],
            [
                'scope' => PermissionsScopes::Project->value,
                'name' => 'Can Create project',
                'slug' => Str::slug('Can Create project'),
                'group_id' => $projectGr->id
            ],
            [
                'scope' => PermissionsScopes::Project->value,
                'name' => 'Can View project',
                'slug' => Str::slug('Can View project'),
                'group_id' => $projectGr->id
            ],
            [
                'scope' => PermissionsScopes::Project->value,
                'name' => 'Can Update project',
                'slug' => Str::slug('Can Update project'),
                'group_id' => $projectGr->id
            ],
            [
                'scope' => PermissionsScopes::Project->value,
                'name' => 'Can Delete project',
                'slug' => Str::slug('Can Delete project'),
                'group_id' => $projectGr->id
            ],
            [
                'scope' => PermissionsScopes::Project->value,
                'name' => 'Can see time sheet for all users',
                'slug' => Str::slug('can-see-all-time-sheet'),
                'group_id' => $projectGr->id
            ],
            [
                'scope' => PermissionsScopes::Project->value,
                'name' => 'Can create document',
                'slug' => Str::slug('Can create document'),
                'group_id' => $projectGr->id
            ],
            [
                'scope' => PermissionsScopes::Project->value,
                'name' => 'Can update document',
                'slug' => Str::slug('Can update document'),
                'group_id' => $projectGr->id
            ],
            [
                'scope' => PermissionsScopes::Project->value,
                'name' => 'Can create task',
                'slug' => Str::slug('Can create task'),
                'group_id' => $projectGr->id
            ],
            [
                'scope' => PermissionsScopes::Project->value,
                'name' => 'Can create board',
                'slug' => Str::slug('Can create board'),
                'group_id' => $projectGr->id
            ],
            [
                'scope' => PermissionsScopes::Project->value,
                'name' => 'Can update board',
                'slug' => Str::slug('Can update board'),
                'group_id' => $projectGr->id
            ],
            [
                'scope' => PermissionsScopes::Project->value,
                'name' => 'Can add task to board',
                'slug' => Str::slug('Can add task to board'),
                'group_id' => $projectGr->id
            ],
            [
                'scope' => PermissionsScopes::Project->value,
                'name' => 'Can delete document',
                'slug' => Str::slug('Can delete document'),
                'group_id' => $projectGr->id
            ],
            [
                'scope' => PermissionsScopes::Company->value,
                'name' => 'Can Invite Users',
                'slug' => Str::slug('Can Invite Users'),
                'group_id' => $companyGr->id
            ],
            [
                'scope' => PermissionsScopes::Company->value,
                'name' => 'Can Deactivate Users',
                'slug' => Str::slug('Can Deactivate Users'),
                'group_id' => $usersGr->id
            ],
            [
                'scope' => PermissionsScopes::Company->value,
                'name' => 'Can Delete Users',
                'slug' => Str::slug('Can Delete Users'),
                'group_id' => $usersGr->id
            ],
            [
                'scope' => PermissionsScopes::Company->value,
                'name' => 'Can View Users',
                'slug' => Str::slug('Can View Users'),
                'group_id' => $usersGr->id
            ],

        ]);
    }
}
