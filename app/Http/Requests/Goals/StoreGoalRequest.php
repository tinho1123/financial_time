<?php

namespace App\Http\Requests\Goals;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreGoalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge($this->amountsInCents(['target_in_cents', 'saved_in_cents']));
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'target_in_cents' => ['required', 'integer', 'min:1'],
            'saved_in_cents' => ['nullable', 'integer', 'min:0'],
            'deadline' => ['nullable', 'date', 'after_or_equal:today'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Informe o nome da meta.',
            'name.max' => 'O nome deve ter no máximo 100 caracteres.',
            'target_in_cents.required' => 'Informe o valor da meta.',
            'target_in_cents.integer' => 'O valor deve ser um número válido.',
            'target_in_cents.min' => 'O valor da meta deve ser maior que zero.',
            'saved_in_cents.integer' => 'O valor guardado deve ser um número válido.',
            'saved_in_cents.min' => 'O valor guardado não pode ser negativo.',
            'deadline.date' => 'Informe uma data válida.',
            'deadline.after_or_equal' => 'O prazo não pode estar no passado.',
        ];
    }

    /**
     * Converts decimal inputs (e.g. "1500,50") to integer cents, keeping empty values untouched.
     *
     * @param  list<string>  $fields
     * @return array<string, int>
     */
    protected function amountsInCents(array $fields): array
    {
        return collect($fields)
            ->filter(fn (string $field) => filled($this->input($field)))
            ->mapWithKeys(fn (string $field) => [
                $field => (int) round((float) str_replace(',', '.', (string) $this->input($field)) * 100),
            ])
            ->all();
    }
}
