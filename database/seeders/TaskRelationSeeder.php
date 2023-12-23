<?php

namespace Database\Seeders;

use App\Models\TaskRelation;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TaskRelationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        TaskRelation::query()
            ->insert([
                [
                    'name' => 'Parent',
                    'can_parent_be_closed' => false
                ],
                [
                    'name' => 'Related to',
                    'can_parent_be_closed' => false
                ],
                [
                    'name' => 'Blocked by',
                    'can_parent_be_closed' => false
                ],
                [
                    'name' => 'Subtask',
                    'can_parent_be_closed' => true
                ]
            ]);
        //
    }
}
