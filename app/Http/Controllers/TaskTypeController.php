<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTaskTypeRequest;
use App\Http\Requests\UpdateTaskTypeRequest;
use App\Models\TaskType;

class TaskTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return TaskType::all();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTaskTypeRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(TaskType $taskType)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTaskTypeRequest $request, TaskType $taskType)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TaskType $taskType)
    {
        //
    }
}
