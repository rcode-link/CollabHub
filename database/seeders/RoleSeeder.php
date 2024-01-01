<?php

namespace Database\Seeders;

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
        $admin = Role::create([
            'title' => 'Admin'
        ]);

        $company = Company::create([
            'name' => 'Company'
        ]);

        $users = User::all();
        $admin->definitions()->attach(PermissionDefinition::all());

        $admin->users()->attach($users);
        $company->users()->attach($users);
        RoleResource::updateOrCreate([
            'role_id' => $admin->id,
            'resourcable_id' => $company->id,
            'resourcable_type' => $company::class
        ], []);

        $users->each(function (User $user) use ($company) {
            $chat = Chat::create([
                'title' => 'Sandbox',
                'chatable_type' => $company::class,
                'chatable_id' => $company->id
            ]);

            $chat->users()->attach($user);
        });

    }
}
