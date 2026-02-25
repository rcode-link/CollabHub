<?php

namespace App\Helpers;

class DateTime
{
    public static function format($date)
    {
        return date('Ymd\THis', strtotime($date)).'Z';
    }
}
