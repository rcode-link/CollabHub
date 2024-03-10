<?php

namespace App\Models;

use App\Events\ChatMessageCreated;
use App\Events\ChatUpdate;
use App\Events\ManagePermissionsEvent;
use Database\Factories\UserFactory;
use Eloquent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Notifications\DatabaseNotificationCollection;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Gate;
use Laravel\Sanctum\HasApiTokens;
use Laravel\Sanctum\PersonalAccessToken;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Collections\MediaCollection;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * App\Models\User
 *
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
 * @method static UserFactory factory($count = null, $state = [])
 * @method static Builder|User newModelQuery()
 * @method static Builder|User newQuery()
 * @method static Builder|User query()
 * @method static Builder|User whereCreatedAt($value)
 * @method static Builder|User whereEmail($value)
 * @method static Builder|User whereEmailVerifiedAt($value)
 * @method static Builder|User whereId($value)
 * @method static Builder|User whereName($value)
 * @method static Builder|User wherePassword($value)
 * @method static Builder|User whereRememberToken($value)
 * @method static Builder|User whereRole($value)
 * @method static Builder|User whereUpdatedAt($value)
 * @property-read Collection<int, \App\Models\Role> $roles
 * @property-read int|null $roles_count
 * @property string|null $start_work_time
 * @property string|null $end_work_time
 * @property int|null $manager_id
 * @method static Builder|User whereEndWorkTime($value)
 * @method static Builder|User whereManagerId($value)
 * @method static Builder|User whereStartWorkTime($value)
 * @property-read User|null $manager
 * @property Carbon|null $deleted_at
 * @method static Builder|User onlyTrashed()
 * @method static Builder|User whereDeletedAt($value)
 * @method static Builder|User withTrashed()
 * @method static Builder|User withoutTrashed()
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Event> $events
 * @property-read int|null $events_count
 * @mixin Eloquent
 */
class User extends Authenticatable implements HasMedia
{
    use HasApiTokens, HasFactory, Notifiable, InteractsWithMedia, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'email_verified_at',
        'role',
        'start_work_time',
        'end_work_time',
        'manager_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',

    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Perform any actions required after the model boots.
     *
     * @return void
     */
    protected static function booted()
    {
        parent::booted(); // TODO: Change the autogenerated stub

        self::created(function (User $user) {
            // create sendbox chat for new user
            $role = Role::create([
                'title' => $user->name,
                'is_visible' => false,
                'can_be_changed' => false
            ]);

            $role->users()->attach($user->id);

            $company = Company::first();
            if ($company) {
                $chat = Chat::create([
                    'title' => 'Sandbox',
                    'chatable_type' => $company::class,
                    'chatable_id' => $company->id
                ]);

                $chat->users()->attach($user);

            }


            // get sendbox chats of other users
            $chats = Chat::query()
                ->whereHasMorph('chatable', Company::class)
                ->with('users')
                ->whereHas('users', fn(Builder $builder) => $builder->whereNot('user_id', $user->id))
                ->get();

            $messageContent = [
                "type" => "doc",
                "content" => [
                    [
                        "type" => "paragraph",
                        "content" => [
                            [
                                "type" => "mention",
                                "attrs" => [
                                    "id" => $user->id,
                                    "label" => $user->name
                                ]
                            ],
                            [
                                "type" => "text",
                                "text" => " just joined your company"
                            ]
                        ]
                    ]
                ]
            ];

            // send messages to other users
            foreach ($chats as $chat) {
                $message = ChatMessage::create([
                    'message' => $messageContent,
                    'user_id' => $chat->users->first()->id,
                    'chat_id' => $chat->id
                ]);
                $message->load('user', 'media', 'videocalls', 'parent', 'messageReactions');
                $message->messageViews()->insert($chat->users->pluck('id')->map(function ($user_id) use ($message) {
                    return [
                        'user_id' => $user_id,
                        'chat_message_id' => $message->id,
                        'reaction' => null
                    ];
                })->toArray());
                ChatUpdate::dispatch($chat->users->toArray(), $message);
                ChatMessageCreated::dispatch($message);
            }
        });


    }


    public function permissions(): Collection
    {
        $data = Cache::get('permissions', collect([]));
        if (!$data || !$data->count()) {
            ManagePermissionsEvent::dispatch();
        }

        return $data->filter(fn($obj) => $obj['users']->contains($this->id));
    }

    public function manager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'manager_id');
    }


    public function authorize(string $action, Model|int $model): void
    {
        Gate::authorize('check-permission', [$model, $action]);
    }

    public function company(): BelongsToMany
    {
        return $this->belongsToMany(Company::class, 'user_company')->where('is_costumer_company', false);
    }


    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function hasPermission($model, $action): int
    {
        return $this->permissions()->contains($action . '.' . $model->id);
    }

    public function registerMediaCollections(): void
    {
        $this
            ->addMediaCollection('avatar')
            ->singleFile()
            ->useFallbackUrl(config('app.url') . '/storage/images/avatar.png')
            ->useFallbackPath(public_path('storage/images/asailvatar.png'));
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_role');
    }

    public function events()
    {
        return $this->hasMany(Event::class);
    }

    public function todayMeetings()
    {
        $events = $this->events()->whereBetween('start_time', [now()->startOfDay(), now()->endOfDay()])
            ->orWhere('freq_until', '>=', now()->startOfDay())
            ->get();
        return $events->map(function ($obj) {
            return [
                'from' => $obj->start_time,
                'to' => $obj->end_time
            ];
        });
    }

}
