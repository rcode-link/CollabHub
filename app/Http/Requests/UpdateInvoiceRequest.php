<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateInvoiceRequest extends FormRequest
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
            'number' => ['nullable', 'unique:invoices,number'],
            'date' => ['nullable', 'date'],
            'due_date' => ['nullable', 'date'],
            'note' => ['nullable', 'string'],
            'sent' => ['nullable', 'bool']
        ];
    }
}
