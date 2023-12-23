<?php

namespace Database\Seeders;

use App\Models\TaskStatuses;
use Illuminate\Database\Seeder;

class TaskStatusesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        TaskStatuses::insert([
           [
               'title' => 'Open',
               'order' => 0,
               'open' => true
           ],
            [
                'title' => 'In Progress',
                'order' => 1,
                'open' => true
            ],
            [
                'title' => 'Done',
                'order' => 2,
                'open' => false
            ]
        ]);
        //
    }
}
