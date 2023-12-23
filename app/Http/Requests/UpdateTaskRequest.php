<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTaskRequest extends FormRequest
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
            'name' => ['nullable', 'string'],
            'user_id' => ['nullable', 'exists:users,id'],
            'status_id' => ['nullable', 'exists:task_statuses,id'],
            'type_id' => ['nullable', 'exists:task_types,id'],
            'description' => ['nullable'],
            'related_tasks' => ['nullable','array'],
            'related_tasks.*.task_relation_id' => ['nullable', 'exists:task_relations,id'],
            'related_tasks.*.task_id' => ['nullable', 'exists:tasks,id'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string'],
            'due_date' => ['nullable', 'date'],
        ];
    }
}
