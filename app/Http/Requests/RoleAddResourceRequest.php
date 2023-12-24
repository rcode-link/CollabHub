<?php

namespace App\Http\Requests;

use App\Helpers\Enums\PermissionsScopes;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RoleAddResourceRequest extends FormRequest
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
            'resource_type' => [Rule::enum(PermissionsScopes::class)],
            'resource' => ['exists:'.\Str::plural(request()->get('resource_type', null)).',id']
        ];
    }
}
