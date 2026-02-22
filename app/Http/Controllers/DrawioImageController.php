<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DrawioImageController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'data' => ['required', 'string'],
        ]);

        // data is a base64 data-URL: "data:image/png;base64,<payload>"
        $dataUrl = $request->input('data');
        $commaPos = strpos($dataUrl, ',');
        $imageData = base64_decode($commaPos !== false ? substr($dataUrl, $commaPos + 1) : $dataUrl);

        $path = 'drawio/'.Str::uuid().'.png';
        Storage::disk('s3')->put($path, $imageData, 'public');

        return response()->json(['url' => Storage::disk('s3')->url($path)]);
    }
}
