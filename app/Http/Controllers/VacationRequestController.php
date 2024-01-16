<?php

namespace App\Http\Controllers;

use App\Http\Requests\VacationRequest;
use App\Models\Event;

class VacationRequestController extends Controller
{
    public function __invoke(VacationRequest $request, Event $event)
    {

        $event->load('chat', 'chat.users');

        abort_if(!$event->chat->users->contains('id', \Auth::id()), \Symfony\Component\HttpFoundation\Response::HTTP_FORBIDDEN);
        $status = $request->validated('status') === 'accept' ? 'Accepted' : 'Declined';
        $message = [
            "type" => "doc",
            "content" => [
                [
                    "type" => "paragraph",
                    "content" => [
                        [
                            "type" => "text",
                            "text" => " $status vacation request"
                        ]
                    ]
                ]
            ]
        ];
        $event->chat->sendMessage($message);
        if (\Auth::user()->permissions()->pluck('permissions')->flatten()->contains('can-approve-vacation.' . \Auth::user()->company()->first()->id)) {
            $event->update([
                'approved' => $request->validated('status') === 'accept'
            ]);
        }

    }
}
