<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VideoCallRequest extends Model
{
    protected $guarded = [];

    public function videoCall(): BelongsTo
    {
        return $this->belongsTo(VideoCalls::class, 'video_call_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
