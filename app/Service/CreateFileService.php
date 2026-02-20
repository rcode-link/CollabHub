<?php

namespace App\Service;

use App\Models\File;
use App\Models\Project;

class CreateFileService
{
    public function prepareData($data)
    {
        switch ($data['entity_type'] ?? null) {
            case 'project':
                $projectKey = Project::whereId($data['entity_id'])->select('key')->firstOrFail();

                $key = null;
                if ($data['type'] === 'file') {
                    $key = $projectKey->key.'-D-'.($this->getNumberOfFilesForEntity($data['entity_id'], Project::class)) + 1;
                }

                return array_merge($data, ['file_id' => $key, 'entity_type' => Project::class]);
            default:
                return array_merge($data, ['file_id' => null, 'entity_type' => null, 'entity_id' => null]);
        }
    }

    private function getNumberOfFilesForEntity($entityId, $entityType)
    {
        return File::query()->where('entity_id', $entityId)
            ->where('entity_type', $entityType)->where('type', 'file')->count();

    }
}
