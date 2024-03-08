<?php

namespace App\Console\Commands;

use App\Helpers\Enums\PermissionsScopes;
use App\Models\PermissionDefinition;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

use Agence104\LiveKit\AccessToken;
use Agence104\LiveKit\AccessTokenOptions;
use Agence104\LiveKit\VideoGrant;

class AddPermission extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:add-permission';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {

        $tokenOptions = (new AccessTokenOptions())
            ->setIdentity(1444)
            ->setTtl(86400000)
            ->setName("RADAN ");

        $videoGrant = (new VideoGrant())
            ->setRoomJoin(true)
            ->setRoomName('$video->slug');


        $token = (new AccessToken(apiKey: config('livekit.key'), apiSecret: config('livekit.secret')))
            ->init($tokenOptions)
            ->setGrant($videoGrant)
            ->toJwt();

        dd($token);

        //
//        $scopeArray = [];
//        foreach (PermissionsScopes::cases() as $item) {
//            $scopeArray[] = $item->value;
//        }
//
//        $name = $this->ask('Enter permission name');
//        $groupID = $this->choice('What is the group of permission',
//            $groups->pluck('name', 'id')->toArray());
//
//        $scope = $this->choice('What is the scope of permission',
//            $scopeArray);
//
//
//        $this->info('Inserting permission definition!');
//        $permission = PermissionDefinition::insert([
//            'scope' => $scope,
//            'name' => $name,
//            'slug' => Str::slug($name),
//            'group_id' => $groups->where('name', $groupID)->first()->id
//        ]);
//        $this->info('Done inserting permission definition!');

    }

}
