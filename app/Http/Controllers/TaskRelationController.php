<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTaskRelationRequest;
use App\Http\Requests\UpdateTaskRelationRequest;
use App\Http\Resources\TaskRelationResource;
use App\Models\TaskRelation;


class TaskRelationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return TaskRelationResource::collection(TaskRelation::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTaskRelationRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(TaskRelation $taskRelation)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTaskRelationRequest $request, TaskRelation $taskRelation)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TaskRelation $taskRelation)
    {
        //
    }
}
