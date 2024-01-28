<?php

namespace Database\Seeders;

use App\Models\TaskRelation;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
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
                'name' => 'Blocked by'
            ],
            [
                'name' => 'Related to'
            ],
        ]);
    }
}
