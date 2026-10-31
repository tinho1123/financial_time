<?php

namespace App\Http\Requests\Settings;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class CoupleSplitUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge(collect(['own_income_in_cents', 'partner_income_in_cents'])
            ->mapWithKeys(fn (string $field) => [
                $field => filled($this->input($field))
                    ? (int) round((float) str_replace(',', '.', (string) $this->input($field)) * 100)
                    : null,
            ])
            ->all());
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'partner_name' => ['nullable', 'string', 'max:100'],
            'own_income_in_cents' => ['nullable', 'integer', 'min:0', 'required_with:partner_name'],
            'partner_income_in_cents' => ['nullable', 'integer', 'min:0', 'required_with:partner_name'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'partner_name.max' => 'O nome deve ter no máximo 100 caracteres.',
            'own_income_in_cents.required_with' => 'Informe a sua renda mensal.',
            'own_income_in_cents.min' => 'A renda não pode ser negativa.',
            'partner_income_in_cents.required_with' => 'Informe a renda mensal do parceiro(a).',
            'partner_income_in_cents.min' => 'A renda não pode ser negativa.',
        ];
    }
}
