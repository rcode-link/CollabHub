<?php

namespace App\Console\Commands;

use App\Helpers\SigneRoute;
use App\Models\Company;
use App\Models\Invitations;
use Carbon\Carbon;
use Illuminate\Console\Command;
use App\Mail\WelcomeAdminEmail;
use App\Models\Role;
use Mail;

class AddAdminCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:add-admin-command {email}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'This command is used to generate registration link for user';

    /**
     * Execute the console command.
     */
    public function handle()
    {

        $link = Invitations::create([
            'company_id' => Company::whereIsCostumerCompany(false)->firstOrFail()->id,
            'number_of_invitations' => 1,
            'registered' => [],
            'role_id' => Role::where([
                'title' => 'Admin',
                'can_be_changed' => false
            ])->firstOrFail()->id
        ]);

        $url = SigneRoute::make('invite.user', ['id' => $link->key], Carbon::now()->addMinutes(30));

        Mail::to($this->argument('email'))->send(new WelcomeAdminEmail($url));
    }
}
