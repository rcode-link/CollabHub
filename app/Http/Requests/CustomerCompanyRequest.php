<?php

namespace App\Http\Requests;

use App\Models\Company;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CustomerCompanyRequest extends FormRequest
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
        $company = Company::whereId(request()->get('id'))->first();
        return [
            'name' => ['required'],
            'prefix' => [Rule::requiredIf($company ? $company->is_costumer_company : true), Rule::unique('companies', 'prefix')->ignore(request()->get('id'))],
            'address' => ['required'],
            'currency_id' => ['required', 'exists:currencies,id'],
            'city' => ['required'],
            'zip' => ['required'],
            'country' => ['required'],
            'billing_address' => ['nullable', 'string'],
            'billing_city' => ['nullable', 'string'],
            'billing_zip' => ['nullable', 'string'],
            'billing_country' => ['nullable', 'string'],

        ];
    }
}
