<?php

namespace App\Models;

use App\Helpers\HasChat;
use Eloquent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Collections\MediaCollection;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * App\Models\Task
 *
 * @property int $id
 * @property string $name
 * @property array|null $description
 * @property int|null $user_id
 * @property int $created_by
 * @property int $project_id
 * @property int $type_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property string|null $task_id
 * @property string|null $due_date
 * @property array|null $tags
 * @property-read \App\Models\Chat|null $chat
 * @property-read Collection<int, Task> $children
 * @property-read int|null $children_count
 * @property-read \App\Models\User|null $createdBy
 * @property-read mixed $task_relations
 * @property-read MediaCollection<int, Media> $media
 * @property-read int|null $media_count
 * @property-read \App\Models\User|null $owner
 * @property-read Collection<int, Task> $parents
 * @property-read int|null $parents_count
 * @property-read \App\Models\Project $project
 * @property-read Collection<int, \App\Models\TaskSprint> $sprints
 * @property-read int|null $sprints_count
 * @property-read \App\Models\TaskType|null $type
 * @method static \Database\Factories\TaskFactory factory($count = null, $state = [])
 * @method static Builder|Task newModelQuery()
 * @method static Builder|Task newQuery()
 * @method static Builder|Task query()
 * @method static Builder|Task whereCreatedAt($value)
 * @method static Builder|Task whereCreatedBy($value)
 * @method static Builder|Task whereDescription($value)
 * @method static Builder|Task whereDueDate($value)
 * @method static Builder|Task whereId($value)
 * @method static Builder|Task whereName($value)
 * @method static Builder|Task whereProjectId($value)
 * @method static Builder|Task whereTags($value)
 * @method static Builder|Task whereTaskId($value)
 * @method static Builder|Task whereTypeId($value)
 * @method static Builder|Task whereUpdatedAt($value)
 * @method static Builder|Task whereUserId($value)
 * @property-read Collection<int, \App\Models\TaskSprint> $taskSprintData
 * @property-read int|null $task_sprint_data_count
 * @mixin Eloquent
 */
class Task extends Model implements HasMedia
{
    use InteractsWithMedia;
    use HasFactory;
    use HasChat;

    protected $guarded = [];

    protected $casts = [
        'description' => 'array',
        'tags' => 'array'
    ];

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function getTaskRelationsAttribute($value)
    {
        $this->load(
            'children',
            'parents',
            'children.type',
            'children.owner',
            'children.project',
            'parents.type',
            'parents.owner',
            'parents.project',
        );
        // Merge collections and return single collection.
        return $this->children->merge($this->parents);
    }


    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function type(): BelongsTo
    {
        return $this->belongsTo(TaskType::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function parents(): BelongsToMany
    {
        return $this->belongsToMany(Task::class, 'task_task', 'task_id');
    }

    public function children(): BelongsToMany
    {
        return $this->belongsToMany(Task::class, 'task_task', 'parent_id')
            ->withPivot('task_relation_id');
    }

    public function taskSprintData(): HasMany
    {
        return $this->hasMany(TaskSprint::class)->orderBy('created_at');
    }
}
