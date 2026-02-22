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
        $tmp_dir = storage_path('app/tmp');
        if (!is_dir($tmp_dir)) {
            mkdir($tmp_dir, 0755, true);
        }

        $path_to_image = $tmp_dir . '/avatar_' . $this->user->id . '.png';

        GenerateImage::profileImage($this->user->name)->toPng()->save($path_to_image);

        $this->user
            ->addMedia($path_to_image)
            ->toMediaCollection('avatar', 's3');
    }
}
