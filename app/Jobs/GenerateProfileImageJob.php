<?php

namespace App\Jobs;

use App\Helpers\GenerateImage;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class GenerateProfileImageJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(public User $user)
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        //
        $path_to_image = storage_path($this->user->name . '.png');

        GenerateImage::profileImage($this->user->name)->toPng()->save($path_to_image);
        $this->user->addMedia($path_to_image)->toMediaCollection('avatar');
    }
}
