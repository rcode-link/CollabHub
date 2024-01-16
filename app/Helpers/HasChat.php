<?php

namespace App\Helpers;

use App\Models\Chat;
use Illuminate\Database\Eloquent\Relations\MorphOne;

trait HasChat
{
    public function chat(): MorphOne
    {
        return $this->morphOne(Chat::class, 'chatable');
    }
}
