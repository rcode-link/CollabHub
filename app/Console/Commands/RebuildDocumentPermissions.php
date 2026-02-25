<?php

namespace App\Console\Commands;

use App\Events\ManagePermissionsEvent;
use Illuminate\Console\Command;

class RebuildDocumentPermissions extends Command
{
    protected $signature = 'permissions:rebuild-documents';

    protected $description = 'Rebuild permissions cache including per-document permissions for all existing files';

    public function handle(): void
    {
        $this->info('Rebuilding permissions cache...');

        ManagePermissionsEvent::dispatch();

        $this->info('Done. Per-document permissions generated for all existing files.');
    }
}
