<?php

namespace App\Http\Requests;

use App\Rules\TaskInProject;
use Illuminate\Foundation\Http\FormRequest;

class StoreTimeSheetRequest extends FormRequest
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
            'start' => ['string', 'required'],
            'end' => ['string', 'required'],
            'project_id' => ['required'],
            'task_id' => ['required', new TaskInProject],
        ];
    }
}
