<?php

namespace App\Http\Requests\Goals;

use Illuminate\Contracts\Validation\ValidationRule;

class UpdateGoalRequest extends StoreGoalRequest
{
    public function authorize(): bool
    {
        return $this->route('goal')->user_id === $this->user()->id;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            ...parent::rules(),
            'deadline' => ['nullable', 'date'],
        ];
    }
}
