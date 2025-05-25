<?php

namespace App\Http\Controllers;

use App\Http\Requests\ReportRequest;
use App\Http\Resources\ReportResource;
use App\Service\ServiceInterface;
use Auth;

class ReportController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(ReportRequest $request, ServiceInterface $service)
    {

        Auth::user()->authorize('can-see-timesheet-report', Auth::user()->company()->first());

        return ReportResource::collection($service->filter($request->validated()));
        //
    }

    public function generate() {}
}
