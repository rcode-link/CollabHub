<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFilesRequest;
use App\Http\Requests\UpdateFilesRequest;
use App\Models\File;
use App\Models\Project;
use Illuminate\Http\Request;

class FileController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        return File::query()
            ->where([
                'entity_type' => Project::class,
                'entity_id' => $request->get('entity_id', null)
            ])
            ->get()->toFlatTree();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreFilesRequest $request)
    {
        $data = $request->validated();

        switch ($data['entity_type']) {
            case 'project':
                $data['entity_type'] = Project::class;
                $numberOfFilesInProject = File::where('entity_id', $request->get('entity_id'))
                    ->where('entity_type', Project::class)->where('type', 'file')->count();
                $projectKey = Project::whereId($request->get('entity_id'))->select('key')->firstOrFail();
                $data['file_id'] = $projectKey->key . '-D-' . $numberOfFilesInProject;
                break;
            default:

        }


        $model = File::query()->create($data);

        if (!$model->parent_id) {
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
     * Update the specified resource in storage.
     */
    public function update(UpdateFilesRequest $request, $file)
    {
        File::whereId($file)->update($request->validated());

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
