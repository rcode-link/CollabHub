<?php

namespace Database\Seeders;

use App\Models\TaskRelation;
use Illuminate\Database\Seeder;

class TaskRelationsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        TaskRelation::insert([
            [
                'name' => 'Parent of',
                'direction' => 'parent',
            ],
            [
                'name' => 'Child of',
                'direction' => 'child',
            ],
            [
                'name' => 'Blocked by',
                'direction' => 'child',
            ],
        ]);
    }
}
