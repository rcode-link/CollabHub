<?php

namespace App\Http\Controllers;

use App\Events\HandleVacationRequestEvent;
use App\Helpers\Enums\EventTypes;
use App\Http\Requests\CreateEventRequest;
use App\Http\Resources\EventResource;
use App\Models\Event;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class CalendarController extends Controller
{
    public function getMyEvents(Request $request)
    {
        $startDate = now()->set(['year' => $request->get('year'), 'month' => $request->get('month')])->startOf('month');
        $endDate = now()->set(['year' => $request->get('year'), 'month' => $request->get('month')])->endOf('month');
        $events = Event::query()
            ->with('user', 'videocalls')
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

    public function view(Event $event)
    {
        $event->load('creator');
        return new EventResource($event);
    }

    public function update(CreateEventRequest $request, Event $event)
    {

        abort_if(\Auth::id() != $event->user_id, Response::HTTP_FORBIDDEN);
        $event->load('videocalls');
        $data = $request->validated();
        $data['approved'] = ($event->type != $data['type'] && $data['type'] == EventTypes::Vacation->value) ? false : true;
        $event->update($request->validated());
        if ($request->get('has_video') && !$event->videocalls) {
            $event->videocalls()->create([
                'title' => $request->get('summary'),
                'users' => [],
                'slug' => Str::uuid()
            ]);
        }

        if (!$request->get('has_video') && $event->videocalls) {
            $event->videocalls()->delete();
        }
        $event->user()->sync($request->validated('users'));
    }


    public function destroy(Event $event)
    {
        abort_if(\Auth::id() != $event->user_id, Response::HTTP_FORBIDDEN);
        $event->videocalls()->delete();
        $event->chat()->delete();
        $event->delete();

        return response()->noContent();

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
        $data['approved'] = $data['type'] === EventTypes::Event->value;
        $event = Event::create($data);


        if ($request->get('has_video')) {
            $event->videocalls()->create([
                'title' => $data['summary'],
                'users' => [],
                'slug' => Str::uuid()
            ]);
        }

        $event->user()->sync($users);
        HandleVacationRequestEvent::dispatch($event);
        return response()->json('');
    }

    public function calDav(Request $request, $path = null)
    {
        $icalendarData = Event::convertToICalendarFormat();
        return response($icalendarData)
            ->header('Content-Type', 'text/calendar');

    }
}
