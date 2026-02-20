<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class EditorImageController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'image' => ['required', 'file', 'image', 'max:10240'],
        ]);

        $file = $request->file('image');
        $extension = $file->getClientOriginalExtension();
        $path = 'editor-images/'.Str::uuid().'.'.$extension;

        Storage::disk('s3')->put($path, file_get_contents($file), 'private');

        $url = Storage::disk('s3')->temporaryUrl($path, now()->addHours(24));

        return response()->json(['url' => $url]);
    }
}
