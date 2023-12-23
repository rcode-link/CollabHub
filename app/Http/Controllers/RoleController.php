<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\UpdateRoleRequest;
use App\Models\Role;

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
        $role->update($data);

        if ($request->has('users')) {
            $role->users()->sync($request->get('users'));
        }
        if ($request->has('permissions')) {
            $role->definitions()->sync($request->get('permissions'));
        }
        return $role;
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Role $role)
    {
        $role->users()->sync([]);
        $role->definitions()->sync([]);
        $role->delete();
        //
    }
}
