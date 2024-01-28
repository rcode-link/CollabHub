<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSprintRequest;
use App\Http\Requests\UpdateSprintRequest;
use App\Models\Board;
use App\Models\Sprint;
use Illuminate\Http\Request;

class SprintController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSprintRequest $request)
    {

        $board = Board::query()->select('project_id')->whereId($request->get('board_id'))->first();
        \Auth::user()->authorize('can-create-board', $board->project_id);
        $sprint = Sprint::create($request->validated());

        if ($request->get('is_active', false)) {
            $sprint->activate();
        }

        return response()->json($sprint);
    }


    public function activate(Request $request, Sprint $sprint)
    {
        $sprint->load('board');
        \Auth::user()->authorize('can-create-board', $sprint->board->project_id);
        $sprint->activate();
        return $sprint;
    }

    /**
     * Display the specified resource.
     */
    public function show(Sprint $sprint)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSprintRequest $request, Sprint $sprint)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Sprint $sprint)
    {
        //
    }
}
