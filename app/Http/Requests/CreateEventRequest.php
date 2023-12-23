<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
            'start_time' => ['string'],
            'end_time' => ['string'],
            'freq' => ['nullable', 'in:WEEKLY,DAILY'],
            'freq_settings' => ['nullable', 'string'],
            'freq_until' => [Rule::requiredIf(fn() => request()->has('freq')), 'string'],
            'users.*' => ['exists:users,id']
        ];
    }
}
