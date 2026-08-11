<?php

namespace App\Http\Requests\RecurringTransactions;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRecurringTransactionRequest extends FormRequest
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
        $startDate = $this->route('recurring_transaction')?->start_date?->format('Y-m-d');

        return [
            'category_id' => ['nullable', 'integer', Rule::exists('categories', 'id')->where('user_id', $this->user()->id)],
            'type' => ['required', 'string', Rule::in(['income', 'expense'])],
            'amount_in_cents' => ['required', 'integer', 'min:1'],
            'description' => ['required', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'frequency' => ['required', 'string', Rule::in(['weekly', 'monthly', 'yearly'])],
            'end_date' => ['nullable', 'date', "after_or_equal:{$startDate}"],
            'is_active' => ['required', 'boolean'],
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
            'notes.max' => 'As observações devem ter no máximo 1000 caracteres.',
            'frequency.required' => 'Selecione a frequência.',
            'frequency.in' => 'Frequência inválida.',
            'end_date.date' => 'Data de término inválida.',
            'end_date.after_or_equal' => 'A data de término deve ser igual ou posterior à data de início.',
            'is_active.required' => 'Informe se a recorrência está ativa.',
        ];
    }
}
