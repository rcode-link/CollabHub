<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class EditorFileController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'file' => ['required_without:image', 'file', 'max:20480'],
            'image' => ['required_without:file', 'file', 'max:20480'],
        ]);

        $file = $request->file('file') ?? $request->file('image');
        $isImage = str_starts_with($file->getMimeType(), 'image/');
        $folder = $isImage ? 'editor-images' : 'editor-files';
        $path = $folder.'/'.Str::uuid().'.'.$file->getClientOriginalExtension();

        Storage::disk('s3')->put($path, file_get_contents($file), 'public');

        return response()->json([
            'url' => '/api/v1/editor/files/'.$path,
            'name' => $file->getClientOriginalName(),
            'type' => $file->getMimeType(),
            'image' => $isImage,
        ]);
    }

    public function show(string $path)
    {
        if (! Storage::disk('s3')->exists($path)) {
            abort(404);
        }

        try {
            $url = Storage::disk('s3')->temporaryUrl($path, now()->addMinutes(2));
        } catch (\Exception) {
            $url = Storage::disk('s3')->url($path);
        }

        return response()->json(['url' => $url]);
    }
}
