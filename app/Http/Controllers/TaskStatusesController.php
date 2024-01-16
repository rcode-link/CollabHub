<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTaskStatusesRequest;
use App\Http\Requests\UpdateTaskStatusesRequest;
use App\Http\Resources\TaskStatusResource;
use App\Models\TaskStatuses;
use Illuminate\Http\Request;

class TaskStatusesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        return TaskStatusResource::collection(TaskStatuses::query()
            ->where('project_id', $request->get('project_id'))
            ->where('board_id', $request->get('board_id'))
            ->orderBy('order')->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTaskStatusesRequest $request)
    {
        \Auth::user()->authorize('can-update-board',  $request->get('project_id'));

        TaskStatuses::create($request->validated());

        return response()->noContent();

    }

    /**
     * Display the specified resource.
     */
    public function show(TaskStatuses $taskStatuses)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTaskStatusesRequest $request, TaskStatuses $tasks_status)
    {

        \Auth::user()->authorize('can-update-board',  $tasks_status->project_id);
        $data = $request->validated();

        if(isset($data['order'])){
           $success =  $tasks_status->updateOrder($data['order']);
        }


        if(!isset($data['order'])){
            $success =  $tasks_status->update($data);
        }

       return response()->noContent();
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TaskStatuses $taskStatuses)
    {
        //
    }
}
