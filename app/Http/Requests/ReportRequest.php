<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReportRequest extends FormRequest
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
        return array_merge([
            'type' => ['required', 'in:timesheet'],
        ], $this->timesheetRules());
    }
    private function timesheetRules(): array
    {

        return [
            'project_id' => ['exists:projects,id'],
            'start_time' => ['date'],
            'end_time' => ['date', 'after:start_time'],
            'group_by' => ['in:task,user']
        ];
    }
}
