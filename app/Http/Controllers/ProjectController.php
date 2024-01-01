<?php

namespace App\Http\Controllers;

use App\Events\ProjectCreated;
use App\Http\Requests\ProjectAddUserRequest;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Http\Resources\UserResource;
use App\Models\Chat;
use App\Models\File;
use App\Models\Permission;
use App\Models\PermissionDefinition;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;
use function PHPUnit\Framework\throwException;

class ProjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $projectIds = Auth::user()->permissions()->filter(fn($obj) => $obj['model']['type'] === Project::class)
            ->map(fn($obj) => $obj['model']['id'])->flatten()->toArray();
        $project = Project::whereIn('id', $projectIds)->paginate(50);
        return ProjectResource::collection($project);

    }

    public function getProjectUsers(Request $request)
    {
        $this->validate($request, [
            'project_id' => [
                'required', 'exists:projects,id'
            ]
        ]);


        $users = Auth::user()->permissions()->filter(fn($obj) => $obj['model']['type'] === Project::class && $obj['model']['id'] == $request->get('project_id'))->map(fn($obj) => $obj['users'])->flatten();


        $list = User::query()
            ->whereIn('id', $users->toArray())
            ->when(Str::length($request->get('user', '')) > 0, function (Builder $builder) use ($request) {
                $builder->where('name', 'like', '%' . $request->get('user') . '%')
                    ->orWhere('email', 'like', '%' . $request->get('user') . '%');
            });

        return UserResource::collection($list->paginate());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProjectRequest $request)
    {
        DB::beginTransaction();
        try {

        Auth::user()->authorize('can-create-project', Auth::user()->company()->first());
        $data = $request->validated();
        $data['key'] = Str::upper(Str::slug($data['key']));
        $project = Project::create($data);
        ProjectCreated::dispatch($project);
            DB::commit();
        return response()->json($project);
        } catch (\Exception $exception) {
            DB::rollBack();
            throwException($exception);
            return response()->json([]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Project $project)
    {
        Auth::user()->authorize('can-view-project', $project);

        return $project;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProjectRequest $request, Project $project)
    {

        //
    }

    public function addUsers(ProjectAddUserRequest $request, Project $project)
    {

        $data = $request->validated();
        $permissions = [];
        foreach ($data as $arr) {
            $tmpPermission = PermissionDefinition::query()
                ->whereIn('id', $arr['permissions'])->pluck('slug')
                ->map(function ($obj) use ($arr, $project) {
                    return [
                        'permission' => $obj . '.' . $project->id,
                        'user_id' => $arr['userId'],
                        'resourceable_id' => $project->id,
                        'resourceable_type' => $project::class,
                    ];
                });

            $permissions = array_merge($permissions, $tmpPermission->toArray());
        }
        Permission::insert($permissions);

        return response()->json($permissions);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Project $project)
    {
        DB::beginTransaction();
        try {
            Chat::whereHasMorph('chatable', Task::class, function (Builder $builder) use ($project) {
                return $builder->where('project_id', $project->id);
            })->delete();
            Task::whereProjectId($project->id)->delete();
            File::whereHasMorph('entity', Project::class, function (Builder $builder) use ($project) {
                return $builder->where('id', $project->id);
            })->delete();
            $project->delete();

            DB::commit();
            return response()->noContent();
        } catch (\Throwable $e) {
            DB::rollBack();
            \Log::error('delete project', [$e]);
            return response()
                ->json([
                    'data' => 'Something went wrong'
                ], Response::HTTP_INTERNAL_SERVER_ERROR);

        }
    }
}
