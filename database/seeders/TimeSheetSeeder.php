<?php

namespace Database\Seeders;

use App\Models\TimeSheet;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class TimeSheetSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

//        TimeSheet::truncate();


        $data = [];
        for ($j = 1; $j < 30; $j++) {
            for ($i = 0; $i < 8; $i++) {
                $hour = rand(8, 16);
                $date = Carbon::create(2023,12 ,$j , $hour, 0, 0);
                $data[] = [
                    'start' => $date,
                    'end' => Carbon::create(2023,12 ,$j , $hour, rand(0, 50), 0),
                    'task_id' => 44,
                    'user_id' => 1
                ];
            }
        }

        TimeSheet::insert($data);
        dd($data);

        //
    }
}
