<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\PermissionDefinition;
use App\Models\PermissionGroup;
use App\Models\TaskStatuses;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // \App\Models\me::factory(10)->create();

        User::truncate();
        PermissionGroup::truncate();
        PermissionDefinition::truncate();
        $user = \App\Models\User::factory()->create([
            'name' => 'Administrator',
            'email' => 'admin@admin.com',
            'role' => 'admin'
        ]);
        $this->call(TaskTypeSeeder::class);
        $this->call(TaskStatusesSeeder::class);
        $this->call(PermissionSeeder::class);
        $this->call(CompanySeeder::class);

        $user->company()->attach([
            'company_id' => 1
        ]);
    }
}
