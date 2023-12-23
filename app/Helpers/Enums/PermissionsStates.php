<?php

namespace App\Helpers\Enums;

enum PermissionsStates: string
{
case Create = 'create';
case Read = 'read';
case Update = 'update';
case Delete = 'delete';

}
