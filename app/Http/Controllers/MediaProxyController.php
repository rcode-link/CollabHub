<?php

namespace App\Http\Controllers;

use App\Models\Chat;
use App\Models\ChatMessage;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class MediaProxyController extends Controller
{
    public function show(Media $media)
    {
        $this->authorizeMedia($media);

        try {
            $url = $media->getTemporaryUrl(now()->addMinutes(2));
        } catch (\Exception) {
            $url = $media->getUrl();
        }

        return response()->json(['url' => $url]);
    }

    private function authorizeMedia(Media $media): void
    {
        $model = $media->model;

        if ($model instanceof ChatMessage) {
            $isMember = Chat::where('id', $model->chat_id)
                ->whereHas('users', fn ($q) => $q->where('user_id', auth()->id()))
                ->exists();

            if (!$isMember) {
                abort(403, 'You do not have access to this file.');
            }
        }
    }
}
