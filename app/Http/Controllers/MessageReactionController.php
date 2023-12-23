<?php

namespace App\Http\Controllers;

use App\Events\ChatMessageUpdated;
use App\Http\Requests\StoreMessageReactionRequest;
use App\Http\Requests\UpdateMessageReactionRequest;
use App\Models\ChatMessage;
use App\Models\MessageReaction;

class MessageReactionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreMessageReactionRequest $request)
    {

        MessageReaction::query()->updateOrCreate([
            'user_id' => $request->validated('user_id'),
            'chat_message_id' => $request->validated('chat_message_id')
        ],
        [
            'reaction' => $request->validated('reaction')
        ]);

        $message = ChatMessage::relations()
            ->where('id', $request->validated('chat_message_id'))
            ->firstOrFail();

        ChatMessageUpdated::broadcast($message);

        return response()->noContent();
    }

    /**
     * Display the specified resource.
     */
    public function show(MessageReaction $messageReaction)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateMessageReactionRequest $request, MessageReaction $messageReaction)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MessageReaction $messageReaction)
    {
        //
    }
}
