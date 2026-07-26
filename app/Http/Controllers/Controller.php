<?php

namespace App\Http\Controllers;

use App\Models\File;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Support\Facades\Auth;

class Controller extends BaseController
{
    use AuthorizesRequests, ValidatesRequests;

    /**
     * Authorize access to a document/file.
     * Project files: check the project-scoped per-document permission.
     * Global (personal) files have no project scope — only the creator can access them.
     */
    protected function authorizeFileAccess(File $file, string $permission): void
    {
        if (! $file->entity_id) {
            abort_unless($file->created_by === Auth::id(), 403, 'Not authorized.');

            return;
        }

        Auth::user()->authorize($permission, $file->id);
    }
}
