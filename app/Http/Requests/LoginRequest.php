<?php

namespace App\Http\Requests;

use App\Http\Requests\helpers\UserPasswordRules;
use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email'],
            'password' => UserPasswordRules::$BASE_RULES
        ];
    }

}
