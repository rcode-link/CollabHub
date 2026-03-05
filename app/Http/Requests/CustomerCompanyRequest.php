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
        $id = $this->route('customer') ?? request()->get('id');
        $company = $id ? Company::whereId($id)->first() : null;

        return [
            'name' => ['required'],
            'billing_info' => ['nullable', 'string'],
            'prefix' => [Rule::requiredIf((bool) ($company ? $company->is_costumer_company : true)), Rule::unique('companies', 'prefix')->ignore($id)],
            'address' => ['required'],
            'currency_id' => ['required', 'exists:currencies,id'],
            'city' => ['required'],
            'zip' => ['required'],
            'country' => ['required'],
            'billing_address' => ['nullable', 'string'],
            'billing_city' => ['nullable', 'string'],
            'billing_zip' => ['nullable', 'string'],
            'billing_country' => ['nullable', 'string'],
            'default_vat_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'email' => ['nullable', 'email'],
            'invoice_locale' => ['nullable', 'in:en,bs'],
            'invoice_cc_emails' => ['nullable', 'string'],
        ];
    }
}
