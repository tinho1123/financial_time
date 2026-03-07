<?php

namespace App\Http\Requests\Accounts;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'type' => ['required', 'string', Rule::in(['checking', 'savings', 'cash', 'credit', 'investment'])],
            'initial_balance_in_cents' => ['required', 'integer', 'min:-99999999999', 'max:99999999999'],
        ];
    }
}
