<?php

namespace App\Http\Requests\Budgets;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBudgetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('amount_in_cents')) {
            $this->merge([
                'amount_in_cents' => (int) round((float) str_replace(',', '.', $this->amount_in_cents) * 100),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'amount_in_cents' => ['required', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'amount_in_cents.required' => 'Informe o valor do orçamento.',
            'amount_in_cents.integer' => 'O valor deve ser um número válido.',
            'amount_in_cents.min' => 'O valor deve ser maior que zero.',
        ];
    }
}
