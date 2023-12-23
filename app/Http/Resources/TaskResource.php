<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property int $id
 * @property string $name
 * @property string $task_id
 * @property array|null $description
 * @property int $user_id
 * @property int $created_by
 * @property int $project_id
 * @property int $type_id
 * @property int $status_id
 * @property int $children_count
 * @property int $parents_count
 * @property int|null $task_status_id
 * @property string|null $due_date
 * @property array|null $tags
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User|null $createdBy
 * @property-read \Spatie\MediaLibrary\MediaCollections\Models\Collections\MediaCollection<int, \Spatie\MediaLibrary\MediaCollections\Models\Media> $media
 * @property-read int|null $media_count
 * @property-read \App\Models\TaskStatuses|null $status
 * @property-read \App\Models\User|null $owner
 * @property-read \App\Models\Project|null $project
 * @property-read \App\Models\TaskType|null $type
 * @property-read \App\Models\Chat|null $chat
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Sprint> $sprints
 * @property-read Collection<int, \App\Models\TaskSprint> $taskSprintData
 *
 *
 */
class TaskResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'task_id' => $this->task_id,
            'project_id' => $this->project_id,
            'user' => $this->whenLoaded('owner', function () {
                return new UserResource($this->owner);
            }),
            'createdBy' => $this->whenLoaded('createdBy', function () {
                return new UserResource($this->createdBy);
            }),
            'description' => $this->description,
            'status' => $this->whenLoaded('taskSprintData', function () {
                $mapped = $this->taskSprintData->map(fn($obj) => array_merge($obj->status->toArray(), ['sprint' => $obj?->sprint]));
                if (\request()->has('board_id') || \request()->has('sprint_id')) {
                    return $mapped->first();
                }
                return $mapped;
            }),
            'type' => $this->whenLoaded('type', function () {
                return $this->type;
            }),
            'children_count' => $this->children_count,
            'relation' => $this->whenLoaded('pivot', function () {
                return $this->relation;
            }),
            'sprints' => $this->whenLoaded('sprints', function () {
                return $this->sprints;
            }),
            'chat_id' => $this->whenLoaded('chat', function () {
                return $this->chat->id;
            }),
            'due_date' => $this->due_date === null ? null : Carbon::parse($this->due_date),
            'tags' => $this->tags,
            'media' => $this->when(\request()->routeIs('tasks.show'), function () {
                return $this->whenLoaded('media', function () {
                    return MediaResource::collection($this->media);
                });
            })
        ];
    }
}
