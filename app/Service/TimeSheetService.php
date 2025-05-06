<?php

namespace App\Service;

use App\Models\TimeSheet;
use Illuminate\Http\Request;

class TimeSheetService implements ServiceInterface
{

    public function filter(array $request)
    {

        $model = new TimeSheet;

        if (isset($request['project_id'])) {
            $model = $model->whereHas('task', fn($query) => $query->where('project_id', $request['project_id']));
        }

        if (isset($request['start_time'])) {
            $model = $model->where('start', '>=', $request['start_time']);
        }
        if (isset($request['end_time'])) {
            $model = $model->where('start', '<=', $request['end_time']);
        }


        return $model->select('id', 'start', 'end', 'task_id', 'user_id')->with(['user' => fn($query) => $query->select('id', 'name'), 'task' => fn($query) => $query->select('id', 'name')])->get();
    }
    public function generatePDF(array $request) {}
}
