<?php

namespace App\Events;

use App\Models\Project;
use App\Models\TaskStatuses;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ProjectCreated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(Project $project)
    {
        \Auth::user()->permissions()->insert([
            [
                'permission' => 'can-view-project.' . $project->id,
                'resourceable_id' => $project->id,
                'resourceable_type' => Project::class,
                'user_id' => \Auth::id()
            ],
            [
                'permission' => 'can-delete-project.' . $project->id,
                'resourceable_id' => $project->id,
                'resourceable_type' => Project::class,
                'user_id' => \Auth::id()
            ],
            [
                'permission' => 'can-update-project.' . $project->id,
                'resourceable_id' => $project->id,
                'resourceable_type' => Project::class,
                'user_id' => \Auth::id()
            ],
            [
                'permission' => 'can-create-task.' . $project->id,
                'resourceable_id' => $project->id,
                'resourceable_type' => Project::class,
                'user_id' => \Auth::id()
            ]
        ]);

        $statuses = TaskStatuses::whereNull('project_id')->get()->map(function ($obj) use ($project) {
            $obj->project_id = $project->id;
            $obj->id = null;
            return $obj;
        });

        TaskStatuses::insert($statuses->toArray());
    }
}
