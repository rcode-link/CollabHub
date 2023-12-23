<?php

namespace App\Http\Resources;

use App\Helpers\Enums\ChatTypes;
use App\Models\ChatMessage;
use App\Models\MessageReaction;
use App\Models\Task;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;
use Tiptap\Editor;

/**
 * @property int $id
 * @property string|null $title
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property string $chatable_type
 * @property int $chatable_id
 * @property-read ChatMessage|null $last_message
 * @property-read Collection<int, MessageReaction> $messageReactions
 * @property-read int|null $message_reactions_count
 * @property-read Collection<int, ChatMessage> $messages
 * @property-read int|null $messages_count
 * @property-read Collection<int, MessageReaction> $numberOfUnreadMessages
 * @property-read int|null $number_of_unread_messages_count
 * @property-read Collection<int, User> $users
 * @property-read int|null $users_count
 * @property-read Model|\Eloquent $chatable
 *
 */
class ChatResource extends JsonResource
{
    private int $NUMBER_OF_USERS_IN_PRIVATE_CHAT = 2;

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $response = $this->getChatTypeAndTitle();

        return [
            'id' => $this->id,
            'title' => $response['title'],
            'type' => $response['type'],
            'avatar' => $response['avatar'],
            'item_key' => $this->whenLoaded('chatable', $this->getChattableKey()),
            'unreadMessages' => $this->number_of_unread_messages_count,
            'message' => $this->whenLoaded('last_message', function () {
                return [
                    'text' => (new Editor())->setContent($this->last_message->message ?? ['content' => ''])->getText([
                        'blockSeparator' => "\n",
                    ]),
                    'created_at' => $this->last_message->created_at,
                    'user' => $this->last_message->user->name
                ];
            })
        ];
    }

    public function getChatTypeAndTitle(): array
    {
        if ($this->chatable_type === User::class &&
            $this->users_count <= $this->NUMBER_OF_USERS_IN_PRIVATE_CHAT) {
            $user = $this->users->first();
            return [
                'title' => $user?->name,
                'type' => ChatTypes::USER->value,
                'avatar' => $user?->getFirstMediaUrl('avatar')
            ];
        }

        return [
            'title' => $this->title,
            'type' => $this->chatable_type === User::class ? ChatTypes::GROUP->value : Str::lower(\Str::replace('\\App\\Models\\', '', $this->chatable_type)),
            'avatar' => ''
        ];
    }

    private function getChattableKey(): string
    {

        if($this->chatable_type === Task::class){
            return $this->chatable->task_id;
        }

        return '';
    }
}
