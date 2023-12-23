<?php

namespace App\Http\Controllers;

use App\Http\Requests\RegisterRequest;
use App\Models\Company;
use App\Models\Invitations;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class RegisterController extends Controller
{
    public function __invoke(RegisterRequest $request)
    {
        $data = $request->except('company_id');
        $invitation = Invitations::where(['key' => $request->get('id')])
            ->firstOrFail();

        abort_if(count($invitation->registered) >=$invitation->number_of_invitations, 422, 'Invalid link');

        $data['password'] = Hash::make($request->get('password'));
        DB::beginTransaction();
        try {
            $user = User::create($data);

            $user->company()->attach([
                'company_id' => $invitation->company_id
            ]);

            $user->permissions()->create([
                'permission' => 'can-view-company.' . $invitation->company_id,
                'resourceable_id' => $invitation->company_id,
                'resourceable_type' => Company::class,
            ]);
            $user->permissions()->create([
                    'permission' => 'can-view-users.' . $invitation->company_id,
                    'resourceable_id' => $invitation->company_id,
                    'resourceable_type' => Company::class,
                ]
            );
            $invitation->update([
                'registered' => array_merge($invitation->registered ?? [], [$data['email']])
            ]);
            DB::commit();
            return response()->json([
                'status' => 'ok'
            ]);
        } catch (\Exception $exception) {
            DB::rollBack();
            throw $exception;
        }

    }
}
