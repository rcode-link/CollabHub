<?php

namespace App\Console\Commands;

use App\Helpers\Enums\PermissionsScopes;
use App\Models\PermissionDefinition;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

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
