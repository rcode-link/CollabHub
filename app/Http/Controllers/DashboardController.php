<?php

namespace App\Http\Controllers;

use App\Http\Resources\ChatResource;
use App\Http\Resources\TaskResource;
use App\Models\Chat;
use App\Models\Task;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function unreadMessages()
    {
        $numberOfUnreadMessage = Chat::query()
            ->with(['last_message', 'last_message.user'])
            ->whereHas('users', function ($query) {
                $query->where('user_id', Auth::id());
            })
            ->withCount('users')
            ->withCount('numberOfUnreadMessages')
            ->having('number_of_unread_messages_count', '!=', 0)
            ->get();

        return ChatResource::collection($numberOfUnreadMessage);
    }

    public function openTasks()
    {

        $tasks = Task::query()
            ->where('user_id', Auth::id())
            ->with('type', 'owner', 'project')
            ->whereHas('taskSprintData', function (Builder $builder){
                $builder->whereHas('status', fn (Builder $query) => $query->where('open', true));
            })
            ->paginate();

        return TaskResource::collection($tasks);
    }
}
