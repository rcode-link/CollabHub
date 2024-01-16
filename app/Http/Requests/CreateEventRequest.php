<?php

namespace App\Http\Requests;

use App\Helpers\Enums\EventTypes;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class CreateEventRequest extends FormRequest
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
            'summary' => ['required', 'string'],
            'description' => ['nullable', 'string'],
            'start_time' => ['date'],
            'end_time' => ['date', 'after_or_equal:start_time'],
            'freq' => ['nullable', 'in:WEEKLY,DAILY'],
            'freq_settings' => ['nullable', 'string'],
            'freq_until' => [Rule::requiredIf(fn() => request()->has('freq')), 'string'],
            'users.*' => ['exists:users,id'],
            'has_video' => ['bool'],
            'type' => [new Enum(EventTypes::class)]
        ];
    }

    protected function prepareForValidation()
    {
        $this->merge([
            'has_video' => $this->request->get('has_video', false)
        ]);
    }
}
