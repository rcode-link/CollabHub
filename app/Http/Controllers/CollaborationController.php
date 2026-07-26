<?php

namespace App\Http\Controllers;

use App\Models\File;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CollaborationController extends Controller
{
    /**
     * Authenticate a user for collaborative editing.
     * Called by the Hocuspocus server with the user's Bearer token.
     */
    public function auth(Request $request): JsonResponse
    {
        $request->validate(['document_id' => 'required']);

        $user = Auth::user();
        $file = File::findOrFail($request->document_id);

        $this->authorizeFileAccess($file, 'can-read-document');

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
            ],
        ]);
    }

    /**
     * Fetch document Y.js state for the Hocuspocus server.
     * Server-to-server auth via X-Collab-Secret header.
     */
    public function fetchDocument(Request $request, $id): JsonResponse
    {
        $this->validateCollabSecret($request);

        $file = File::findOrFail($id);

        return response()->json([
            'content' => $file->content,
            'yjs_state' => $file->yjs_state,
        ]);
    }

    /**
     * Store Y.js document state from the Hocuspocus server.
     */
    public function storeDocument(Request $request, $id): JsonResponse
    {
        $this->validateCollabSecret($request);

        $file = File::findOrFail($id);
        $file->update([
            'yjs_state' => $request->input('yjs_state'),
        ]);

        return response()->json(['ok' => true]);
    }

    private function validateCollabSecret(Request $request): void
    {
        $secret = config('services.collaboration.secret');

        if ($request->header('X-Collab-Secret') !== $secret) {
            abort(403, 'Invalid collaboration secret');
        }
    }
}
