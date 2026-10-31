<?php

namespace App\Http\Requests\Goals;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ContributeGoalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->route('goal')->user_id === $this->user()->id;
    }

    protected function prepareForValidation(): void
    {
        if (filled($this->input('amount_in_cents'))) {
            $this->merge([
                'amount_in_cents' => (int) round((float) str_replace(',', '.', (string) $this->input('amount_in_cents')) * 100),
            ]);
        }
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'amount_in_cents' => ['required', 'integer', 'not_in:0'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'amount_in_cents.required' => 'Informe o valor.',
            'amount_in_cents.integer' => 'O valor deve ser um número válido.',
            'amount_in_cents.not_in' => 'O valor não pode ser zero.',
        ];
    }
}
