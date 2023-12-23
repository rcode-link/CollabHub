<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\Task;
use App\Models\TaskSprint;
use App\Models\TaskType;
use Illuminate\Database\Seeder;

class TaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        Task::factory(10000)->create([
            'project_id' => 1,
            'type_id' => TaskType::inRandomOrder()->first()->id
        ]);
        //
    }
}
