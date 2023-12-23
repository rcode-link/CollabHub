<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StoreTaskRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string'],
            'description' => ['nullable'],
            'created_by' => ['exists:users,id'],
            'user_id' => ['nullable', 'exists:users,id'],
            'type_id' => ['required', 'exists:task_types,id'],
            'project_id' => ['required', 'exists:projects,id'],
            'related_tasks' => ['nullable','array'],
            'related_tasks.*.task_relation_id' => ['nullable', 'exists:task_relations,id'],
            'related_tasks.*.task_id' => ['nullable', 'exists:tasks,id'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['nullable', 'string'],
            'due_date' => ['nullable', 'date'],
        ];
    }

    protected function prepareForValidation()
    {
        $this->merge([
            'created_by' => Auth::id(),
        ]);
    }
}
