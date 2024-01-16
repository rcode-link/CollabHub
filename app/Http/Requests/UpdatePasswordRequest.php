<?php

namespace App\Http\Requests;

use App\Http\Requests\helpers\UserPasswordRules;
use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UpdatePasswordRequest extends FormRequest
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
            'current_password' => array_merge(UserPasswordRules::$BASE_RULES, [
                function (string $attribute, mixed $value, Closure $fail) {
                    if (!Hash::check($value, \Auth::user()->password)) {
                        $filedName = str_replace('_', ' ', $attribute);
                        $fail("The $filedName is invalid.");
                    }
                },
            ]),
            'password' => array_merge(UserPasswordRules::WITH_CONFIRMED(), [
                function (string $attribute, mixed $value, Closure $fail) {
                    if (Hash::check($value, \Auth::user()->password)) {
                        $filedName = str_replace('_', ' ', $attribute);
                        $fail("The $filedName cannot be same as current password.");
                    }
                },
            ])
        ];
    }
}
