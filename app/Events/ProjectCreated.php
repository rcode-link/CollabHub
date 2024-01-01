<?php

namespace App\Events;

use App\Helpers\Enums\PermissionsScopes;
use App\Models\Company;
use App\Models\Project;
use App\Models\Role;
use App\Models\RoleResource;
use App\Models\TaskStatuses;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
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
//        \Auth::user()->permissions()->insert([
//            [
//                'permission' => 'can-view-project.' . $project->id,
//                'resourceable_id' => $project->id,
//                'resourceable_type' => Project::class,
//                'user_id' => \Auth::id()
//            ],
//            [
//                'permission' => 'can-delete-project.' . $project->id,
//                'resourceable_id' => $project->id,
//                'resourceable_type' => Project::class,
//                'user_id' => \Auth::id()
//            ],
//            [
//                'permission' => 'can-update-project.' . $project->id,
//                'resourceable_id' => $project->id,
//                'resourceable_type' => Project::class,
//                'user_id' => \Auth::id()
//            ],
//            [
//                'permission' => 'can-create-task.' . $project->id,
//                'resourceable_id' => $project->id,
//                'resourceable_type' => Project::class,
//                'user_id' => \Auth::id()
//            ]
//        ]);

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
