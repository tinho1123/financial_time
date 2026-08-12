<?php

namespace App\Http\Requests\Budgets;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBudgetRequest extends FormRequest
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
            'category_id' => [
                'required',
                'integer',
                Rule::exists('categories', 'id')->where('user_id', $this->user()->id)->where('type', 'expense'),
                Rule::unique('budgets', 'category_id')->where('user_id', $this->user()->id),
            ],
            'amount_in_cents' => ['required', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'category_id.required' => 'Selecione uma categoria.',
            'category_id.exists' => 'Selecione uma categoria de despesa válida.',
            'category_id.unique' => 'Essa categoria já tem um orçamento.',
            'amount_in_cents.required' => 'Informe o valor do orçamento.',
            'amount_in_cents.integer' => 'O valor deve ser um número válido.',
            'amount_in_cents.min' => 'O valor deve ser maior que zero.',
        ];
    }
}
