<?php

namespace Database\Seeders;

use App\Events\ManagePermissionsEvent;
use App\Models\Chat;
use App\Models\Company;
use App\Models\PermissionDefinition;
use App\Models\Role;
use App\Models\RoleResource;
use App\Models\User;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = Role::updateOrCreate([
            'title' => 'Admin',
            'can_be_changed' => false
        ]);

        $company = Company::firstOrCreate([
            'is_costumer_company' => false
        ], [
            'name' => 'Company',
        ]);

        $admin->definitions()->attach(PermissionDefinition::all());

        RoleResource::updateOrCreate([
            'role_id' => $admin->id,
            'resourcable_id' => $company->id,
            'resourcable_type' => $company::class
        ], []);

        ManagePermissionsEvent::dispatch();
    }
}
