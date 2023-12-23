<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTimeSheetRequest;
use App\Http\Requests\UpdateTimeSheetRequest;
use App\Models\TimeSheet;
use App\Rules\TaskInProject;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class TimeSheetController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->validate($request, [
            'project_id' => ['required'],
            'task_id' => ['required', new TaskInProject],
        ]);

        $canSeeAll = Auth::user()
            ->permissions()
            ->where('permission', 'can-see-all-time-sheet' . $request->get('project_id', null))
            ->exists();



        $model = TimeSheet::query()
            ->with('user')
            ->when(!$canSeeAll, function (Builder $query) {
                $query->where('user_id', Auth::id());
            })
            ->where('task_id', $request->get('task_id'))
            ->orderByDesc('start')
            ->get();

        return response()->json($model);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTimeSheetRequest $request)
    {
        Auth::user()->authorize('can-view-project', $request->get('project_id'));
        $data = $request->validated();
        $data['user_id'] = \Auth::id();
        unset($data['project_id']);
        TimeSheet::query()->create($data);
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(TimeSheet $timeSheet)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTimeSheetRequest $request, TimeSheet $timeSheet)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TimeSheet $timeSheet)
    {
        abort_if($timeSheet->user_id !== Auth::id(), Response::HTTP_FORBIDDEN, 'Action not allowed');

        $timeSheet->delete();

        return response()->noContent();
        //
    }
}
