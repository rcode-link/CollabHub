<?php

namespace App\Helpers;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Http\Request;

class FilterTasks
{

    public static function search(Builder $task, Request $request): Builder
    {
        $task->when($request->has('type_id'), function (Builder $query) use ($request) {
            $query->where('type_id', $request->get('type_id'));
        });
        $task->when($request->has('status_id') && $request->has('sprint_id'), function (Builder $query) use ($request) {
            $query->with([
                'taskSprintData' => function (HasMany $builder) use ($request) {
                    $builder
                        ->with([
                            'status' => fn(HasOne $query) => $query->select('id', 'title', 'board_id'),
                            'status.board' => fn(BelongsTo $query) => $query->select('id', 'title'),
                            'sprint' => fn(HasOne $query) => $query->select('id', 'title')
                        ])
                        ->where('task_status_id', $request->get('status_id'))
                        ->where('sprint_id', $request->get('sprint_id'));
                },
            ]);
            $query->whereHas('taskSprintData', fn(Builder $builder) => $builder->where('task_status_id', $request->get('status_id'))->where('sprint_id', $request->get('sprint_id')));
        });

        $task->when($request->has('user_id'), function (Builder $query) use ($request) {
            $query->where('user_id', $request->get('user_id'));
        });

        $task->when(!$request->has('sprint_id'), function (Builder $builder) use ($request) {
            $builder->with([
                'taskSprintData' => function (HasMany $builder) use ($request) {
                    $builder
                        ->with([
                            'status' => fn(HasOne $query) => $query->select('id', 'title', 'board_id'),
                            'status.board' => fn(BelongsTo $query) => $query->select('id', 'title'),
                            'sprint' => fn(HasOne $query) => $query->select('id', 'title')
                        ]);
                },
            ]);
        });

        $task->when($request->has('search'), function (Builder $query) use ($request) {
            $query->where(function (Builder $builder) use ($request) {
                $builder->where('name', 'like', '%' . $request->get('search') . '%')
                    ->orWhere('description', 'like', '%' . $request->get('search') . '%');
            });
        });

        return $task;
    }

}
