<?php

namespace App\Helpers\Enums;

enum ChatTypes: string
{
    case GROUP = 'group';
    case USER = 'user';
    case SYSTEM = 'system';
}
