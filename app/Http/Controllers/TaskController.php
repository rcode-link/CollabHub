<?php

namespace App\Http\Controllers;

use App\Events\AddTaskToSprintEvent;
use App\Events\TaskCreatedEvent;
use App\Events\TaskUpdatedEvent;
use App\Helpers\FilterTasks;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Project;
use App\Models\Sprint;
use App\Models\Task;
use App\Models\TaskRelation;
use App\Models\TaskSprint;
use App\Models\TaskStatuses;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TaskController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {

        Auth::user()->authorize('can-view-project', $request->get('project_id'));

        $tasks = Task::query()
            ->with('type', 'owner', 'taskSprintData.status.board', 'taskSprintData.sprint')
            ->withCount(['children', 'parents'])
            ->where('project_id', $request->get('project_id'));

        $tasks = FilterTasks::search($tasks, $request);

        $tasks->orderByDesc('updated_at');

        return TaskResource::collection($tasks->paginate(10));
    }

    public function getRelations(Request $request, $taskId)
    {
        Auth::user()->authorize('can-view-project', intval($request->get('project_id')));

        $eager = ['type', 'owner', 'project', 'taskSprintData.status.board', 'taskSprintData.sprint'];

        $task = Task::whereTaskId($taskId)->with(
            array_merge(
                array_map(fn ($r) => "children.$r", $eager),
                array_map(fn ($r) => "parents.$r", $eager),
            )
        )->firstOrFail();

        $relationIds = $task->children->pluck('pivot.task_relation_id')
            ->merge($task->parents->pluck('pivot.task_relation_id'))
            ->filter()->unique();
        $relations = TaskRelation::whereIn('id', $relationIds)->get();

        $children = $task->children->map(function (Task $obj) use ($relations) {
            $obj->relation = $relations->where('id', $obj->pivot->task_relation_id)->first();
            return $obj;
        });

        $parents = $task->parents->map(function (Task $obj) use ($relations) {
            $obj->relation = $relations->where('id', $obj->pivot->task_relation_id)->first();
            return $obj;
        });

        return TaskResource::collection($children->merge($parents));
    }

    public function search(Request $request)
    {
        Auth::user()->authorize('can-view-project', $request->get('project_id'));

        $tasks = Task::query()
            ->where('project_id', $request->get('project_id'))
            ->when(\Str::length($request->get('search')), function (Builder $query) use ($request) {
                $query->where('task_id', $request->get('search'))
                    ->orWhere('name', 'like', '%'.$request->get('search').'%')
                    ->orWhere('description', 'like', '%'.$request->get('search').'%');
            });

        return TaskResource::collection($tasks->paginate(10));
    }

    /**
     * Store a newly created resource in storage.
     *
     * @throws \Exception
     */
    public function store(StoreTaskRequest $request)
    {
        Auth::user()->authorize('can-create-task', Project::whereId($request->get('project_id'))->firstOrFail());

        $data = $request->validated();
        unset($data['related_tasks']);
        if (isset($data['due_date'])) {
            $data['due_date'] = Carbon::parse($data['due_date']);
        }
        $project = Project::query()->where('id', $data['project_id'])->firstOrFail();
        $data['description'] = json_decode($data['description']);
        $data['task_id'] = $project->key.'-'.Task::query()->where('project_id', $project->id)->count() + 1;
        $model = Task::create($data);
        $relatedTasks = $request->validated('related_tasks') ?? [];
        $childAttach = [];
        $parentAttach = [];
        $relationIds = collect($relatedTasks)->pluck('task_relation_id')->filter()->unique();
        $relations = TaskRelation::whereIn('id', $relationIds)->get()->keyBy('id');
        foreach ($relatedTasks as $rel) {
            $relation = $relations->get($rel['task_relation_id']);
            if (! $relation) {
                continue;
            }
            $pivot = ['task_relation_id' => $relation->id];
            if ($relation->direction === 'parent') {
                $childAttach[$rel['task_id']] = $pivot;
            } else {
                $parentAttach[$rel['task_id']] = $pivot;
            }
        }
        $model->children()->attach($childAttach);
        $model->parents()->attach($parentAttach);

        if ($request->hasFile('file')) {
            foreach ($request->file('file') as $file) {
                $model->addMedia($file)->toMediaCollection('default');
            }
        }
        TaskCreatedEvent::dispatch($model);

        return new TaskResource($model);

    }

    public function addTaskToSprint(Request $request)
    {

        $request->validate([
            'task_id' => ['required', 'exists:tasks,id'],
            'sprint_id' => ['required', 'exists:sprints,id'],
        ]);

        AddTaskToSprintEvent::dispatch($request);

        return response()->noContent();
    }

    public function removeFromSPrint(Request $request)
    {

        $request->validate([
            'task_id' => ['required', 'exists:tasks,id'],
            'sprint_id' => ['required', 'exists:sprints,id'],
        ]);

        $sprint = Sprint::query()->where('id', $request->get('sprint_id'))->firstOrFail();
        $sprint->tasks()->detach([
            'task_id' => $request->get('task_id'),
        ]);

        return response()->noContent();
    }

    public function tasksForSprint(Request $request)
    {

        $request->validate([
            'sprint_id' => ['required', 'exists:sprints,id'],
            'project_id' => ['required', 'exists:projects,id'],
        ]);

        $tasks = Task::query()
            ->with('type', 'owner', 'project', 'taskSprintData.status.board', 'taskSprintData.sprint')
            ->withCount(['children', 'parents'])
            ->where('project_id', $request->get('project_id'));

        $inSprint = $request->get('in_sprint', false) === 'true';
        $tasks->when(! $inSprint, function (Builder $query) use ($request) {
            $query->whereDoesntHave('taskSprintData', function (Builder $builder) use ($request) {
                $builder->where('sprint_id', $request->get('sprint_id'));
            });
        });

        $tasks->when($inSprint, function (Builder $query) use ($request) {
            $query->whereHas('taskSprintData', function (Builder $builder) use ($request) {
                $builder->where('sprint_id', $request->get('sprint_id'));
            });
        });

        $tasks = FilterTasks::search($tasks, $request);

        return TaskResource::collection($tasks->paginate(10));
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, $task_id)
    {

        $task = Task::query()
            ->with('media', 'owner', 'createdBy', 'type', 'chat')
            ->with([
                'taskSprintData' => function (HasMany $builder) use ($request) {
                    $builder
                        ->with([
                            'status' => fn (HasOne $query) => $query->select('id', 'title', 'board_id'),
                            'status.board' => fn (BelongsTo $query) => $query->select('id', 'title'),
                            'sprint' => fn (HasOne $query) => $query->select('id', 'title'),
                        ])
                        ->when($request->get('status_id'), function (Builder $query) use ($request) {
                            $query->where('task_status_id', $request->get('status_id'));
                        })
                        ->when($request->get('board_id'), function (Builder $query) use ($request) {
                            $query->whereHas('sprint', function (Builder $builder) use ($request) {
                                return $builder->where('board_id', $request->get('board_id'));
                            });
                        });
                },
            ])
            ->where('task_id', $task_id);

        return new TaskResource($task->firstOrFail());
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTaskRequest $request, $task_id)
    {
        $task = Task::query()->where('task_id', $task_id)->firstOrFail();
        $data = $request->validated();
        unset($data['related_tasks']);
        unset($data['sprint_id']);
        unset($data['status_id']);
        if (isset($data['due_date'])) {
            $data['due_date'] = Carbon::parse($data['due_date']);
        }

        $task->update($data);
        if ($request->get('name')) {
            $task->chat()->update(['title' => $request->get('name')]);
        }

        if ($request->has('related_tasks')) {
            $relatedTasks = $request->validated('related_tasks') ?? [];
            $childAttach = [];
            $parentAttach = [];
            $relationIds = collect($relatedTasks)->pluck('task_relation_id')->filter()->unique();
            $relations = TaskRelation::whereIn('id', $relationIds)->get()->keyBy('id');
            foreach ($relatedTasks as $rel) {
                $relation = $relations->get($rel['task_relation_id']);
                if (! $relation) {
                    continue;
                }
                $pivot = ['task_relation_id' => $relation->id];
                if ($relation->direction === 'parent') {
                    $childAttach[$rel['task_id']] = $pivot;
                } else {
                    $parentAttach[$rel['task_id']] = $pivot;
                }
            }
            $task->children()->sync($childAttach);
            $task->parents()->sync($parentAttach);
        }

        $sendTask = Task::query()
            ->where('task_id', $task_id)
            ->with('media', 'owner', 'createdBy', 'type', 'taskSprintData', 'chat')
            ->first();
        TaskUpdatedEvent::dispatch($sendTask, null);

        return response()->json($sendTask);
    }

    public function changeTaskStatus(Request $request)
    {
        $request->validate([
            'task_id' => ['required', 'exists:tasks,id'],
            'sprint_id' => ['exists:sprints,id'],
            'status_id' => ['required'],
        ]);

        $taskSprint = TaskSprint::whereTaskId($request->get('task_id'))
            ->whereSprintId($request->get('sprint_id'))
            ->with(['status' => fn ($q) => $q->select('id', 'title')])
            ->first();

        $oldStatusTitle = $taskSprint?->status?->title ?? 'Unknown';

        TaskSprint::whereTaskId($request->get('task_id'))
            ->whereSprintId($request->get('sprint_id'))
            ->update([
                'task_status_id' => $request->get('status_id'),
            ]);

        $newStatus = TaskStatuses::whereId($request->get('status_id'))->first();
        $newStatusTitle = $newStatus?->title ?? 'Unknown';

        $task = Task::whereId($request->get('task_id'))->with('media', 'owner', 'createdBy', 'type', 'chat')->first();

        if ($task->chat && $oldStatusTitle !== $newStatusTitle) {
            $task->chat->sendMessage([
                'type' => 'doc',
                'content' => [[
                    'type' => 'paragraph',
                    'content' => [[
                        'type' => 'text',
                        'text' => "Status changed from \"{$oldStatusTitle}\" to \"{$newStatusTitle}\"",
                    ]],
                ]],
            ]);
        }

        TaskUpdatedEvent::dispatch($task, null);

        return response()->noContent();
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Task $task)
    {
        //
    }
}
