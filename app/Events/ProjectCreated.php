<?php

namespace App\Events;

use App\Models\Project;
use App\Models\Role;
use App\Models\RoleResource;
use App\Models\TaskStatuses;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Auth;

class ProjectCreated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(Project $project)
    {
        $roles = Role::whereHas('users', fn(Builder $builder) => $builder->where('user_id', Auth::id()))
            ->whereHas('definitions', fn(Builder $builder) => $builder->where('slug', 'can-create-project'))->get();

        foreach ($roles as $role){
            RoleResource::updateOrCreate([
                'role_id' => $role->id,
                'resourcable_id' => $project->id,
                'resourcable_type' => $project::class
            ], []);
        }
        $statuses = TaskStatuses::whereNull('project_id')->get()->map(function ($obj) use ($project) {
            $obj->project_id = $project->id;
            $obj->id = null;
            return $obj;
        });

        TaskStatuses::insert($statuses->toArray());
    }
}
