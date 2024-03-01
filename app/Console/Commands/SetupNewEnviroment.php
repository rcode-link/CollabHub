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
        $this->info("Setting up database");
        $this->prepareDB();
        SetEnviroment::connection($this->model);
        Artisan::call('migrate --seed');
    }

    private function prepareDB()
    {
        $databaseName = $this->model->database_name;
        $username = $this->model->database_name;
        $password = $this->model->database_password;
        $this->info("Creating db");
        \DB::statement("CREATE DATABASE IF NOT EXISTS $databaseName");


        $this->info("Creating user");
        \DB::statement("CREATE USER '$username'@'%' IDENTIFIED BY '$password'");
        $this->info("Adding privilages");
        \DB::statement("GRANT ALL PRIVILEGES ON $databaseName.* TO '$username'@'%'");
        $this->info("Added privilages");

    }
}
