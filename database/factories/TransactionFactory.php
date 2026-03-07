<?php

namespace Database\Factories;

use App\Models\Account;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Transaction>
 */
class TransactionFactory extends Factory
{
    public function definition(): array
    {
        $type = fake()->randomElement(['income', 'expense']);
        $amount = fake()->numberBetween(100, 200000);
        $previous = fake()->numberBetween(0, 1000000);
        $current = $type === 'income' ? $previous + $amount : $previous - $amount;

        return [
            'user_id' => User::factory(),
            'account_id' => Account::factory(),
            'category_id' => Category::factory()->state(['type' => $type]),
            'type' => $type,
            'amount_in_cents' => $amount,
            'previous_balance_in_cents' => $previous,
            'current_balance_in_cents' => $current,
            'description' => fake()->sentence(3),
            'date' => fake()->dateTimeBetween('-3 months', 'now')->format('Y-m-d'),
            'notes' => fake()->optional(0.3)->sentence(),
        ];
    }

    public function income(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'income',
            'current_balance_in_cents' => $attributes['previous_balance_in_cents'] + $attributes['amount_in_cents'],
        ]);
    }

    public function expense(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'expense',
            'current_balance_in_cents' => $attributes['previous_balance_in_cents'] - $attributes['amount_in_cents'],
        ]);
    }
}
