<?php

namespace App\Http\Requests\Transactions;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTransactionRequest extends FormRequest
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
            'category_id' => ['nullable', 'integer', Rule::exists('categories', 'id')->where('user_id', $this->user()->id)],
            'type' => ['required', 'string', Rule::in(['income', 'expense'])],
            'amount_in_cents' => ['required', 'integer', 'min:1'],
            'description' => ['required', 'string', 'max:255'],
            'date' => ['required', 'date'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'type.required' => 'Selecione o tipo da transação.',
            'type.in' => 'Tipo inválido.',
            'amount_in_cents.required' => 'Informe o valor.',
            'amount_in_cents.integer' => 'O valor deve ser um número válido.',
            'amount_in_cents.min' => 'O valor deve ser maior que zero.',
            'description.required' => 'Informe a descrição.',
            'description.max' => 'A descrição deve ter no máximo 255 caracteres.',
            'date.required' => 'Informe a data.',
            'date.date' => 'Data inválida.',
            'notes.max' => 'As observações devem ter no máximo 1000 caracteres.',
        ];
    }
}
