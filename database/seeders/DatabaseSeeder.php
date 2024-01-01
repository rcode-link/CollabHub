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
        User::factory()->create([
            'email' => 'admin@admin.com'
        ]);
        $this->call(TaskTypeSeeder::class);
        $this->call(TaskStatusesSeeder::class);
        $this->call(PermissionSeeder::class);
        $this->call(RoleSeeder::class);

    }
}
