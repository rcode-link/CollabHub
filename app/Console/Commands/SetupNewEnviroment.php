<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

use App\Helpers\SetEnviroment;
use Illuminate\Support\Facades\Artisan;

class SetupNewEnviroment extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:setup-new-enviroment {connection}';

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
        $connection = $this->argument('connection');
        $this->info("Loading enviroment");
        $this->model = SetEnviroment::loadEnv($connection);
        $this->info("Loaded enviroment");
        SetEnviroment::connection($this->model);
        Artisan::call('migrate', ['--seed' => true]);
    }

}
