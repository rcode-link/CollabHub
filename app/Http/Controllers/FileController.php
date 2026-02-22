<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFilesRequest;
use App\Http\Requests\UpdateFilesRequest;
use App\Models\File;
use App\Models\Project;
use App\Service\CreateFileService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class FileController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {

        return File::query()
            ->select('id', 'title', 'type', 'extension', 'parent_id', 'entity_type', 'entity_id', 'created_at', 'updated_at', 'file_id')
            ->when($request->boolean('global', false) === false,
                fn ($q) => $q
                    ->where([
                        'entity_type' => Project::class,
                        'entity_id' => $request->get('entity_id', null),
                    ]))
            ->get()->toFlatTree();
    }

    public function exportPDF(Request $request)
    {
        $pdf = Pdf::loadView('pdf.document', ['content' => $request->get('content')]);

        return $pdf->stream();    // $invoice = Invoice::whereId(9)->with(['items', 'items.billingItem', 'company'])->firstOrFail();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreFilesRequest $request, CreateFileService $createFileService)
    {
        $data = $createFileService->prepareData($request->validated());

        $model = File::query()->create($data);

        if (! $model->parent_id) {
            $model->saveAsRoot();
        }

        if ($model->parent_id) {
            $model->save();
        }

        return response()->noContent();
        //
    }

    /**
     * Display the specified resource.
     */
    public function show($files)
    {
        return response()->json(File::whereId($files)->orWhere('file_id', $files)->firstOrFail());
    }

    /**
     * Enable sharing: generate a unique share token for the file.
     */
    public function share(File $file): JsonResponse
    {
        $token = $file->share_token ?? Str::uuid()->toString();
        $file->update(['share_token' => $token]);

        return response()->json(['share_token' => $token]);
    }

    /**
     * Revoke sharing: remove the share token.
     */
    public function unshare(File $file): JsonResponse
    {
        $file->update(['share_token' => null]);

        return response()->json(['share_token' => null]);
    }

    /**
     * Public read-only access via share token (no auth required).
     */
    public function showShared(string $token): JsonResponse
    {
        $file = File::where('share_token', $token)->firstOrFail();

        return response()->json([
            'title'   => $file->title,
            'content' => $file->content,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateFilesRequest $request, $file)
    {
        $data = $request->validated();
        File::whereId($file)->update($data);

        return response()->noContent();
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(File $file)
    {
        //
    }
}
