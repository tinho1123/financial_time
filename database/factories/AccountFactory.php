<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Account>
 */
class AccountFactory extends Factory
{
    public function definition(): array
    {
        $names = ['Nubank', 'Bradesco', 'Itaú', 'Caixa', 'Santander', 'Inter', 'C6 Bank'];
        $types = ['checking', 'savings', 'cash', 'credit', 'investment'];

        return [
            'user_id' => User::factory(),
            'name' => fake()->randomElement($names),
            'type' => fake()->randomElement($types),
            'initial_balance_in_cents' => fake()->numberBetween(0, 500000),
        ];
    }
}
