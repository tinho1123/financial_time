<?php

namespace App\Http\Requests\Investments;

use Illuminate\Foundation\Http\FormRequest;

class StoreInvestmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('initial_balance_in_cents')) {
            $this->merge([
                'initial_balance_in_cents' => (int) round((float) str_replace(',', '.', $this->initial_balance_in_cents) * 100),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'currency' => ['required', 'string', 'size:3'],
            'initial_balance_in_cents' => ['required', 'integer', 'min:-99999999999', 'max:99999999999'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Informe o nome do investimento.',
            'name.max' => 'O nome deve ter no máximo 100 caracteres.',
            'initial_balance_in_cents.required' => 'Informe o valor inicial investido.',
            'initial_balance_in_cents.integer' => 'O valor inicial deve ser um número válido.',
        ];
    }
}
