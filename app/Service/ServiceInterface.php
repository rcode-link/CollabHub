<?php

namespace App\Service;

use Illuminate\Http\Request;

interface ServiceInterface
{

    public function filter(array $request);


    public function generatePDF(array $request);
}
