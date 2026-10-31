<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Carbon;

class DashboardRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'month' => ['nullable', 'date_format:Y-m'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'month.date_format' => 'Informe o mês no formato AAAA-MM.',
        ];
    }

    public function selectedMonth(): Carbon
    {
        $month = $this->validated('month');

        if (! $month) {
            return Carbon::now()->startOfMonth();
        }

        return Carbon::createFromFormat('!Y-m', $month)->startOfMonth();
    }
}
