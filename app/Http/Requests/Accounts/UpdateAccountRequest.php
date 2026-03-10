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

    public function messages(): array
    {
        return [
            'name.required' => 'Informe o nome da conta.',
            'name.max' => 'O nome deve ter no máximo 100 caracteres.',
            'type.required' => 'Selecione o tipo da conta.',
            'type.in' => 'Tipo de conta inválido.',
            'initial_balance_in_cents.required' => 'Informe o saldo inicial.',
            'initial_balance_in_cents.integer' => 'O saldo inicial deve ser um número válido.',
        ];
    }
}
