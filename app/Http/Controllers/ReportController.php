<?php

namespace App\Http\Controllers;

use App\Http\Resources\TimeTrackingReportResource;
use App\Models\Company;
use App\Models\Invoice;
use App\Models\Project;
use App\Models\TimeSheet;
use App\Models\User;
use Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function timeTracking(Request $request)
    {
        Auth::user()->authorize('can-see-timesheet-report', Auth::user()->company()->first());

        $query = TimeSheet::query()
            ->with(['user', 'task', 'task.project']);

        if ($request->filled('project_id')) {
            $query->whereHas('task', fn ($q) => $q->where('project_id', $request->project_id));
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('search')) {
            $query->whereHas('task', fn ($q) => $q->where('name', 'like', '%'.$request->search.'%'));
        }

        if ($request->filled('date_from')) {
            $query->where('start', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('start', '<=', $request->date_to);
        }

        $query->orderBy('start', 'desc');

        return TimeTrackingReportResource::collection($query->paginate(25));
    }

    public function projectOverview(Request $request)
    {
        Auth::user()->authorize('can-see-timesheet-report', Auth::user()->company()->first());

        $query = Project::query()
            ->withCount('tasks')
            ->withCount(['tasks as open_tasks_count' => function ($q) {
                $q->whereHas('taskSprintData', function ($sq) {
                    $sq->whereHas('status', fn ($ssq) => $ssq->where('open', true));
                });
            }])
            ->addSelect([
                'total_minutes' => TimeSheet::selectRaw('COALESCE(SUM(TIMESTAMPDIFF(MINUTE, start, end)), 0)')
                    ->whereColumn('time_sheets.task_id', 'tasks.id')
                    ->join('tasks', 'tasks.id', '=', 'time_sheets.task_id')
                    ->whereColumn('tasks.project_id', 'projects.id')
                    ->limit(1),
                'team_members_count' => DB::table('tasks')
                    ->selectRaw('COUNT(DISTINCT user_id)')
                    ->whereColumn('tasks.project_id', 'projects.id')
                    ->whereNotNull('tasks.user_id'),
            ]);

        if ($request->filled('search')) {
            $query->where('name', 'like', '%'.$request->search.'%');
        }

        $projects = $query->get()->map(function ($project) {
            $totalMinutes = (int) $project->total_minutes;

            return [
                'id' => $project->id,
                'name' => $project->name,
                'key' => $project->key,
                'total_tasks' => $project->tasks_count,
                'open_tasks' => $project->open_tasks_count,
                'closed_tasks' => $project->tasks_count - $project->open_tasks_count,
                'team_members' => (int) $project->team_members_count,
                'total_hours' => round($totalMinutes / 60, 1),
            ];
        });

        $totals = [
            'total_tasks' => $projects->sum('total_tasks'),
            'open_tasks' => $projects->sum('open_tasks'),
            'closed_tasks' => $projects->sum('closed_tasks'),
            'team_members' => $projects->sum('team_members'),
            'total_hours' => round($projects->sum('total_hours'), 1),
        ];

        return response()->json([
            'data' => $projects,
            'totals' => $totals,
        ]);
    }

    public function teamWorkload(Request $request)
    {
        Auth::user()->authorize('can-see-timesheet-report', Auth::user()->company()->first());

        $companyId = Auth::user()->company()->first()?->id;

        $query = User::query()
            ->whereHas('company', fn ($q) => $q->where('companies.id', $companyId))
            ->withCount(['tasks as tasks_assigned' => function ($q) use ($request) {
                if ($request->filled('project_id')) {
                    $q->where('project_id', $request->project_id);
                }
            }])
            ->withCount(['tasks as tasks_completed' => function ($q) use ($request) {
                if ($request->filled('project_id')) {
                    $q->where('project_id', $request->project_id);
                }
                $q->whereHas('taskSprintData', function ($sq) {
                    $sq->whereHas('status', fn ($ssq) => $ssq->where('open', false));
                });
            }]);

        if ($request->filled('project_id')) {
            $query->whereHas('tasks', fn ($q) => $q->where('project_id', $request->project_id));
        }

        $users = $query->get()->map(function ($user) use ($request) {
            $timesheetQuery = TimeSheet::where('user_id', $user->id);

            if ($request->filled('project_id')) {
                $timesheetQuery->whereHas('task', fn ($q) => $q->where('project_id', $request->project_id));
            }

            if ($request->filled('date_from')) {
                $timesheetQuery->where('start', '>=', $request->date_from);
            }

            if ($request->filled('date_to')) {
                $timesheetQuery->where('start', '<=', $request->date_to);
            }

            $totalMinutes = $timesheetQuery->selectRaw('COALESCE(SUM(TIMESTAMPDIFF(MINUTE, start, end)), 0) as total')
                ->value('total');

            $assigned = $user->tasks_assigned;
            $completed = $user->tasks_completed;
            $rate = $assigned > 0 ? round(($completed / $assigned) * 100) : 0;

            return [
                'id' => $user->id,
                'name' => $user->name,
                'tasks_assigned' => $assigned,
                'tasks_completed' => $completed,
                'completion_rate' => $rate,
                'hours_logged' => round((int) $totalMinutes / 60, 1),
            ];
        });

        $totals = [
            'tasks_assigned' => $users->sum('tasks_assigned'),
            'tasks_completed' => $users->sum('tasks_completed'),
            'completion_rate' => $users->sum('tasks_assigned') > 0
                ? round(($users->sum('tasks_completed') / $users->sum('tasks_assigned')) * 100)
                : 0,
            'hours_logged' => round($users->sum('hours_logged'), 1),
        ];

        return response()->json([
            'data' => $users,
            'totals' => $totals,
        ]);
    }

    public function invoiceSummary(Request $request)
    {
        Auth::user()->authorize('can-see-timesheet-report', Auth::user()->company()->first());

        $query = Company::where('is_costumer_company', true);

        if ($request->filled('company_id')) {
            $query->where('id', $request->company_id);
        }

        $customers = $query->get()->map(function ($customer) use ($request) {
            $invoiceQuery = Invoice::where('company_id', $customer->id);

            if ($request->filled('date_from')) {
                $invoiceQuery->where('date', '>=', $request->date_from);
            }

            if ($request->filled('date_to')) {
                $invoiceQuery->where('date', '<=', $request->date_to);
            }

            $invoices = $invoiceQuery->withSum('payments', 'value')->get();

            $count = $invoices->count();
            $totalInvoiced = $invoices->sum('total');
            $totalPaid = $invoices->sum('payments_sum_value') ?? 0;
            $outstanding = $totalInvoiced - $totalPaid;
            $paymentRate = $totalInvoiced > 0 ? round(($totalPaid / $totalInvoiced) * 100) : 0;

            return [
                'id' => $customer->id,
                'name' => $customer->name,
                'invoices_count' => $count,
                'total_invoiced' => round((float) $totalInvoiced / 100, 2),
                'total_paid' => round((float) $totalPaid / 100, 2),
                'outstanding' => round((float) $outstanding / 100, 2),
                'payment_rate' => $paymentRate,
            ];
        })->filter(fn ($c) => $c['invoices_count'] > 0)->values();

        $totals = [
            'invoices_count' => $customers->sum('invoices_count'),
            'total_invoiced' => round($customers->sum('total_invoiced'), 2),
            'total_paid' => round($customers->sum('total_paid'), 2),
            'outstanding' => round($customers->sum('outstanding'), 2),
            'payment_rate' => $customers->sum('total_invoiced') > 0
                ? round(($customers->sum('total_paid') / $customers->sum('total_invoiced')) * 100)
                : 0,
        ];

        return response()->json([
            'data' => $customers,
            'totals' => $totals,
        ]);
    }
}
