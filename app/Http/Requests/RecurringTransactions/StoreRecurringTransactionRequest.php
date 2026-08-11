<?php

namespace App\Http\Requests\RecurringTransactions;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRecurringTransactionRequest extends FormRequest
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
            'account_id' => ['required', 'integer', Rule::exists('accounts', 'id')->where('user_id', $this->user()->id)],
            'category_id' => ['nullable', 'integer', Rule::exists('categories', 'id')->where('user_id', $this->user()->id)],
            'type' => ['required', 'string', Rule::in(['income', 'expense'])],
            'amount_in_cents' => ['required', 'integer', 'min:1'],
            'description' => ['required', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'frequency' => ['required', 'string', Rule::in(['weekly', 'monthly', 'yearly'])],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
        ];
    }

    public function messages(): array
    {
        return [
            'account_id.required' => 'Selecione uma conta.',
            'account_id.exists' => 'Conta inválida.',
            'type.required' => 'Selecione o tipo da transação.',
            'type.in' => 'Tipo inválido.',
            'amount_in_cents.required' => 'Informe o valor.',
            'amount_in_cents.integer' => 'O valor deve ser um número válido.',
            'amount_in_cents.min' => 'O valor deve ser maior que zero.',
            'description.required' => 'Informe a descrição.',
            'description.max' => 'A descrição deve ter no máximo 255 caracteres.',
            'notes.max' => 'As observações devem ter no máximo 1000 caracteres.',
            'frequency.required' => 'Selecione a frequência.',
            'frequency.in' => 'Frequência inválida.',
            'start_date.required' => 'Informe a data de início.',
            'start_date.date' => 'Data de início inválida.',
            'end_date.date' => 'Data de término inválida.',
            'end_date.after_or_equal' => 'A data de término deve ser igual ou posterior à data de início.',
        ];
    }
}
