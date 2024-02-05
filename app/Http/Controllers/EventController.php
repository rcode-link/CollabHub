<?php

namespace App\Http\Controllers;

use App\Events\CalendarEventUpdatedEvent;
use Illuminate\Http\Request;
use App\Models\Event;

class EventController extends Controller
{
    function __invoke(Request $request, $id)
    {
        $event = Event::query()
            ->whereHas('user', fn($query) => $query->where('user_id', \Auth::id()))
            ->whereId($id)
            ->firstOrFail();

        $status = $request->get('attendance') ? 1 : 0;
        $event->user()->updateExistingPivot(\Auth::id(), ['attending' => $status]);
        $event->load('user', 'creator');

        CalendarEventUpdatedEvent::dispatch($event);

        return $event;
    }
}
