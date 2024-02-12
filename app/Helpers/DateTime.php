<?php

namespace App\Helpers;

class DateTime
{
    static function format($date)
    {
        return date('Ymd\THis', strtotime($date)) . 'Z';
    }
}