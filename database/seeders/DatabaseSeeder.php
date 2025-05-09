<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(PermissionSeeder::class);
        $this->call(TaskTypeSeeder::class);
        $this->call(TaskStatusesSeeder::class);
        $this->call(RoleSeeder::class);
    }
}
