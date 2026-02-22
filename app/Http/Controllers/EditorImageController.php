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
        $path = 'editor-images/'.Str::uuid().'.'.$file->getClientOriginalExtension();

        Storage::disk('s3')->put($path, file_get_contents($file), 'public');

        return response()->json(['url' => Storage::disk('s3')->url($path)]);
    }
}
