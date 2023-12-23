<?php

namespace App\Http\Controllers;

use App\Helpers\SigneRoute;
use App\Http\Resources\UserResource;
use App\Models\Company;
use App\Models\Invitations;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

class CompanyUsersController extends Controller
{
    public function index(Request $request, Company $company)
    {
        Auth::user()->authorize("can-view-users", $company);

        $users = $company
            ->users()
            ->when(Str::length($request->get('user')) > 0, function (Builder $builder) use ($request) {
                $builder->where('name', 'like', '%' . $request->get('user') . '%')
                    ->orWhere('email', 'like', '%' . $request->get('user') . '%');
            });
        return UserResource::collection($users->paginate());
    }

    public function invite(Request $request)
    {

        Auth::user()->authorize('can-invite-users', Auth::user()->company()->first());

        $invite = Invitations::create([
            'company_id' => Auth::user()->company->first()->id,
            'number_of_invitations' => $request->get('number_of_invitations', 1),
            'registered' => []
        ]);

        $validUntil = $request->get('until', null);

        $url = SigneRoute::make('invite.user', ['id' => $invite->key], $validUntil ? Carbon::parse($validUntil)->timestamp : null);
        return response()->json($url);
    }
}
