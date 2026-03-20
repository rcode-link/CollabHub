<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ChatMessageCreateRequest extends FormRequest
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
            'message' => [Rule::requiredIf(request()->files->count() == 0)],
            'parent_id' => ['nullable', 'exists:chat_messages,id'],
            'comment_id' => ['nullable', 'string', 'max:36'],
            'quoted_text' => ['nullable', 'string', 'max:1000'],
            'files.*' => [
                'file',
            ],
        ];
    }
}
