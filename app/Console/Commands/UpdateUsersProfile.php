<?php

namespace App\Console\Commands;

use App\Jobs\GenerateProfileImageJob;
use App\Models\User;
use Illuminate\Console\Command;

class UpdateUsersProfile extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:update-users-profile';

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
        User::doesnthave('media')->get()->map(fn(User $user) => GenerateProfileImageJob::dispatch($user));
        //
    }
}
