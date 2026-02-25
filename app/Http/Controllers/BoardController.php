<?php

namespace App\Http\Controllers;

use App\Events\BoardCreatedEvent;
use App\Http\Requests\StoreBoardRequest;
use App\Http\Requests\UpdateBoardRequest;
use App\Models\Board;
use App\Models\Sprint;
use App\Models\Task;
use App\Models\TaskStatuses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BoardController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        return Board::where('project_id', $request->get('project_id'))
            ->with('sprint')->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreBoardRequest $request)
    {
        \Auth::user()->authorize('can-create-board', $request->get('project_id'));
        $board = Board::create($request->validated());

        BoardCreatedEvent::dispatch($board);

        return response()->noContent();
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Board $board)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateBoardRequest $request, Board $board)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Board $board)
    {
        //
    }

    /**
     * Enable sharing: generate a unique share token for the board.
     */
    public function share(Board $board): JsonResponse
    {
        $token = $board->share_token ?? Str::uuid()->toString();
        $board->update(['share_token' => $token]);

        return response()->json(['share_token' => $token]);
    }

    /**
     * Revoke sharing: remove the share token.
     */
    public function unshare(Board $board): JsonResponse
    {
        $board->update(['share_token' => null]);

        return response()->json(['share_token' => null]);
    }

    /**
     * Public read-only access via share token (no auth required).
     */
    public function showShared(string $token): JsonResponse
    {
        $board = Board::where('share_token', $token)->firstOrFail();

        // Find the active sprint, or fall back to the first sprint
        $sprint = Sprint::where('board_id', $board->id)
            ->where('is_active', true)
            ->first()
            ?? Sprint::where('board_id', $board->id)->first();

        if (! $sprint) {
            return response()->json([
                'title' => $board->title,
                'type' => $board->type,
                'statuses' => [],
            ]);
        }

        $statuses = TaskStatuses::where('board_id', $board->id)
            ->where('project_id', $board->project_id)
            ->orderBy('order')
            ->get();

        $statusData = $statuses->map(function (TaskStatuses $status) use ($sprint) {
            $tasks = Task::query()
                ->with('type', 'owner')
                ->whereHas('taskSprintData', fn ($q) => $q
                    ->where('sprint_id', $sprint->id)
                    ->where('task_status_id', $status->id)
                )
                ->orderByDesc('updated_at')
                ->limit(50)
                ->get()
                ->map(fn (Task $task) => [
                    'id' => $task->id,
                    'name' => $task->name,
                    'task_id' => $task->task_id,
                    'type' => $task->type ? ['id' => $task->type->id, 'title' => $task->type->title] : null,
                    'user' => $task->owner ? ['id' => $task->owner->id, 'name' => $task->owner->name] : null,
                    'tags' => $task->tags,
                    'due_date' => $task->due_date,
                ]);

            return [
                'id' => $status->id,
                'title' => $status->title,
                'color' => $status->color,
                'tasks' => $tasks,
            ];
        });

        return response()->json([
            'title' => $board->title,
            'type' => $board->type,
            'sprint' => [
                'id' => $sprint->id,
                'title' => $sprint->title,
            ],
            'statuses' => $statusData,
        ]);
    }
}
