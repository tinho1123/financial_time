<?php

namespace Database\Factories;

use App\Models\Account;
use App\Models\Category;
use App\Models\RecurringTransaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RecurringTransaction>
 */
class RecurringTransactionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $type = fake()->randomElement(['income', 'expense']);
        $startDate = fake()->dateTimeBetween('-6 months', 'now')->format('Y-m-d');

        return [
            'user_id' => User::factory(),
            'account_id' => Account::factory(),
            'category_id' => Category::factory()->state(['type' => $type]),
            'type' => $type,
            'amount_in_cents' => fake()->numberBetween(1000, 200000),
            'description' => fake()->sentence(3),
            'notes' => fake()->optional(0.3)->sentence(),
            'frequency' => fake()->randomElement(['weekly', 'monthly', 'yearly']),
            'start_date' => $startDate,
            'end_date' => null,
            'next_due_date' => $startDate,
            'is_active' => true,
        ];
    }

    public function weekly(): static
    {
        return $this->state(['frequency' => 'weekly']);
    }

    public function monthly(): static
    {
        return $this->state(['frequency' => 'monthly']);
    }

    public function yearly(): static
    {
        return $this->state(['frequency' => 'yearly']);
    }

    public function inactive(): static
    {
        return $this->state(['is_active' => false]);
    }
}
