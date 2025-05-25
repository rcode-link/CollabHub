<?php

namespace App\Console\Commands;

use App\Jobs\GenerateProfileImageJob;
use App\Models\User;
use Illuminate\Console\Command;

use App\Helpers\SetEnviroment;

class UpdateUsersProfile extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:update-users-profile {env?}';

    private $model;
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
        $connection = $this->argument('env');
        if ($connection) {
            $this->info("Loading enviroment");
            $this->model = SetEnviroment::loadEnv($connection);
            $this->info("Loaded enviroment");
            SetEnviroment::connection($this->model);
        }

        User::doesnthave('media')->get()->map(fn(User $user) => GenerateProfileImageJob::dispatch($user));
        //
    }
}
