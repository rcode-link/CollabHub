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
        //
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
    public function update(UpdateTaskStatusesRequest $request, TaskStatuses $taskStatuses)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TaskStatuses $taskStatuses)
    {
        //
    }
}
