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
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Spatie\Browsershot\Browsershot;

class FileController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        if ($request->boolean('global', false)) {
            $allowedProjectIds = $this->accessibleProjectIds();

            return File::query()
                ->select('id', 'title', 'url', 'type', 'extension', 'parent_id', 'entity_type', 'entity_id', 'created_by', 'created_at', 'updated_at', 'file_id')
                ->where(function ($q) use ($allowedProjectIds) {
                    $q->where(function ($q2) {
                        $q2->whereNull('entity_id')
                            ->where('created_by', Auth::id());
                    })
                        ->orWhere(function ($q2) use ($allowedProjectIds) {
                            $q2->where('entity_type', Project::class)
                                ->whereIn('entity_id', $allowedProjectIds);
                        });
                })
                ->get()->toFlatTree();
        }

        Auth::user()->authorize('can-view-project', $request->get('entity_id'));

        return File::query()
            ->select('id', 'title', 'url', 'type', 'extension', 'parent_id', 'entity_type', 'entity_id', 'created_at', 'updated_at', 'file_id')
            ->where([
                'entity_type' => Project::class,
                'entity_id' => $request->get('entity_id', null),
            ])
            ->get()->toFlatTree();
    }

    public function exportPDF(Request $request)
    {
        $pdf = Pdf::loadView('pdf.document', ['content' => $request->get('content')]);

        return $pdf->stream();
    }

    public function exportAsPdf(File $file)
    {
        $this->authorizeFile($file, 'can-read-document');

        $hadToken = (bool) $file->share_token;

        if (! $file->share_token) {
            $file->update(['share_token' => Str::uuid()->toString()]);
        }

        $baseUrl = config('services.browsershot.app_url') ?: config('app.url');
        $url = $baseUrl.'/d/'.$file->share_token;

        $browsershot = Browsershot::url($url)
            ->setNodeBinary(config('services.browsershot.node_binary', 'node'))
            ->setNpmBinary(config('services.browsershot.npm_binary', 'npm'))
            ->setEnvironmentOptions(['PUPPETEER_CACHE_DIR' => storage_path('app/puppeteer')])
            ->addChromiumArguments(['ignore-certificate-errors', 'no-sandbox'])
            ->emulateMedia('print')
            ->timeout(120)
            ->waitUntilNetworkIdle();

        if ($wsEndpoint = config('services.browsershot.ws_endpoint')) {
            $browsershot->setWSEndpoint($wsEndpoint);
        }

        $pdfContent = $browsershot->pdf();

        if (! $hadToken) {
            $file->update(['share_token' => null]);
        }

        return response($pdfContent, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="'.Str::slug($file->title ?: 'document').'.pdf"',
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreFilesRequest $request, CreateFileService $createFileService)
    {
        if ($request->get('entity_id')) {
            Auth::user()->authorize('can-create-document', $request->get('entity_id'));
        }

        $data = $createFileService->prepareData($request->validated());
        $data['created_by'] = Auth::id();

        $model = File::query()->create($data);

        if (! $model->parent_id) {
            $model->saveAsRoot();
        }

        if ($model->parent_id) {
            $model->save();
        }

        return response()->noContent();
    }

    /**
     * Display the specified resource.
     */
    public function show($files)
    {
        $file = File::whereId($files)->orWhere('file_id', $files)->firstOrFail();

        $this->authorizeFile($file, 'can-read-document');

        return response()->json($file);
    }

    /**
     * Enable sharing: generate a unique share token for the file.
     */
    public function share(File $file): JsonResponse
    {
        $this->authorizeFile($file, 'can-update-document');

        $token = $file->share_token ?? Str::uuid()->toString();
        $file->update(['share_token' => $token]);

        return response()->json(['share_token' => $token]);
    }

    /**
     * Revoke sharing: remove the share token.
     */
    public function unshare(File $file): JsonResponse
    {
        $this->authorizeFile($file, 'can-update-document');

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
            'title' => $file->title,
            'content' => $file->content,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateFilesRequest $request, $file)
    {
        $fileModel = File::findOrFail($file);

        $this->authorizeFile($fileModel, 'can-update-document');

        $fileModel->update($request->validated());

        return response()->noContent();
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(File $file)
    {
        $this->authorizeFile($file, 'can-delete-document');

        $file->delete();

        return response()->noContent();
    }

    /**
     * Authorize access to a file.
     * Project files: check project-scoped permission.
     * Global files: only the creator can access.
     */
    private function authorizeFile(File $file, string $permission): void
    {
        Auth::user()->authorize($permission, $file->id);
    }

    /**
     * Get project IDs the current user has view access to.
     */
    private function accessibleProjectIds(): array
    {
        $permissions = Auth::user()->permissions()->pluck('permissions')->flatten();

        return $permissions
            ->filter(fn ($p) => str_starts_with($p, 'can-view-project.'))
            ->map(fn ($p) => (int) Str::afterLast($p, '.'))
            ->unique()
            ->values()
            ->all();
    }
}
