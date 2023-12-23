<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateEventRequest;
use App\Http\Resources\EventResource;
use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class CalendarController extends Controller
{
    public function getMyEvents(Request $request)
    {
        $startDate = now()->set(['year' => $request->get('year'), 'month' => $request->get('month')])->startOf('month');
        $endDate = now()->set(['year' => $request->get('year'), 'month' => $request->get('month')])->endOf('month');
        $events = Event::query()
            ->with('user')
            ->where(function (Builder $query) {
                $query->where('user_id', \Auth::id())
                    ->orWhereHas('user', fn(Builder $builder) => $builder->where('user_id', \Auth::id()));
            })
            ->where(function (Builder $query) use ($startDate, $endDate) {
                $query->whereBetween('start_time', [$startDate, $endDate])
                    ->orWhere('freq_until', '>=', $startDate)
                    ->orWhere('freq_until', '>=', $endDate);
            })
            ->get();

        return EventResource::collection($events);
    }

    public function update(CreateEventRequest $request, Event $event)
    {
        $event->update($request->validated());
        $event->user()->sync($request->validated('users'));
    }


    public function destroy(Event $event)
    {

    }

    public function insertCalendarItem(CreateEventRequest $request,)
    {
        $data = $request->validated();
        $data['user_id'] = \Auth::id();
        $users = [];
        if (isset($data['users'])) {
            $users = collect($data['users']);
            unset($data['users']);
        }
        $event = Event::create($data);

        $event->user()->sync($users);
        return response()->json('');
    }

    public function calDav(Request $request, $path = null)
    {
        $icalendarData = Event::convertToICalendarFormat();
        return response($icalendarData)
            ->header('Content-Type', 'text/calendar');

    }
}
