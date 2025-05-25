<?php

namespace Database\Seeders;

use App\Models\TaskType;
use Illuminate\Database\Seeder;

class TaskTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (TaskType::count()) {
            return;
        }
        TaskType::insert([
            [
                'title' => 'User Story',
            ],
            [
                'title' => 'Task',
            ]
        ]);
    }
}
