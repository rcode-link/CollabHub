<?php

namespace App\Http\Resources;

use App\Models\Company;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Notifications\DatabaseNotificationCollection;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Laravel\Sanctum\PersonalAccessToken;
use Spatie\MediaLibrary\MediaCollections\Models\Collections\MediaCollection;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * @property-read User|null $manager
 * @property int $id
 * @property string $name
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property mixed $password
 * @property string $role
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Collection<int, Company> $company
 * @property-read int|null $company_count
 * @property-read MediaCollection<int, Media> $media
 * @property-read int|null $media_count
 * @property-read DatabaseNotificationCollection<int, DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read int|null $permissions_count
 * @property-read Collection<int, PersonalAccessToken> $tokens
 * @property-read int|null $tokens_count
 * @property string|null $start_work_time
 * @property string|null $end_work_time
 * @property int|null $manager_id
 * @property Carbon|null $deleted_at
 * @method Collection permissions()
 *
 */
class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'avatar' => $this->getFirstMediaUrl('avatar'),
            'start_work_time' => $this->start_work_time,
            'end_work_time' => $this->end_work_time,
            'deleted_at' => $this->deleted_at,
            'manager' => $this->whenLoaded('manager', fn() => new UserResource($this->manager)),
            'view_profile' => $this->when(\request()->routeIs('apiusers.show'), function () {
                return $this->permissions()->filter(fn($obj) => $obj['users']->contains($this->id))->pluck('model');
            }),
            'availability' => $this->todayMeetings()
        ];
    }
}
