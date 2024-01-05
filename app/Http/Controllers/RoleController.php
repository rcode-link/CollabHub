<?php

namespace App\Http\Controllers;

use App\Events\ManagePermissionsEvent;
use App\Helpers\Enums\PermissionsScopes;
use App\Http\Requests\RoleAddResourceRequest;
use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\UpdateRoleRequest;
use App\Models\Company;
use App\Models\Permission;
use App\Models\Project;
use App\Models\Role;
use App\Models\RoleResource;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {

        return Role::all();
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRoleRequest $request)
    {
        Role::create($request->validated());

        return response()->noContent();
    }

    /**
     * Display the specified resource.
     */
    public function show(Role $role)
    {
        return $role->load('users', 'definitions');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRoleRequest $request, Role $role)
    {

        $data = $request->validated();
        unset($data['users']);
        unset($data['permissions']);
        unset($data['resource']);
        if($role->can_be_changed){
            $role->update($data);
        }

        if ($request->has('users')) {
            $role->users()->attach($request->get('users'));
        }
        if ($request->has('permissions') && $role->can_be_changed) {
            $role->definitions()->sync($request->get('permissions'));
        }

        ManagePermissionsEvent::dispatch();

        return $role;
        //
    }

    public function removeUserFromRole(Request $request, Role $role){
        $request->validate([
            'user' => ['exists:users,id']
        ]);
        $role->users()->detach([$request->get('user')]);
        ManagePermissionsEvent::dispatch();
        return $request->all();
    }

    public function addResource(RoleAddResourceRequest $request, Role $role): \Illuminate\Http\Response
    {

        RoleResource::updateOrCreate([
            'role_id' => $role->id,
            'resourcable_id' => $request->get('resource'),
            'resourcable_type' => $request->get('resource_type') === PermissionsScopes::Project->value ? Project::class : Company::class
        ], []);

        ManagePermissionsEvent::dispatch();

        return response()->noContent();
    }

    public function getAllResources($role)
    {

        return RoleResource::whereRoleId($role)->with('resourcable')->get();
    }

    public function getResource(Request $request)
    {

        $permission = [];
        switch ($request->get('resource_type')) {
            case PermissionsScopes::Project->value:
                $projectIds = Auth::user()->permissions()->filter(fn($obj) => $obj['model']['type'] === Project::class)->pluck('model.id');
                $permission = Project::whereIn('id', $projectIds)->get()->map(function (Project $project) {
                    return [
                        'value' => $project->id,
                        'name' => $project->name
                    ];
                });
                break;
            case PermissionsScopes::Company->value:
                $permission = Auth::user()->permissions()->filter(fn($obj) => $obj['model']['type'] === Company::class)->map(function ($permission) {
                        return [
                            'value' => $permission['model']['id'],
                            'name' => $permission['model']['name']
                        ];
                    });
                break;
        }

        return $permission;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Role $role)
    {
        abort_if(!$role->can_be_changed, Response::HTTP_FORBIDDEN);
        $role->users()->sync([]);
        $role->definitions()->sync([]);
        $role->delete();

        ManagePermissionsEvent::dispatch();
        return response()->noContent();
    }
}
