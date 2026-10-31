<?php

namespace Database\Factories;

use App\Models\Goal;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Goal>
 */
class GoalFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->randomElement(['Reserva de emergência', 'Viagem', 'Carro novo', 'Entrada do apartamento']),
            'target_in_cents' => fake()->numberBetween(500000, 5000000),
            'saved_in_cents' => 0,
            'deadline' => null,
        ];
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'saved_in_cents' => $attributes['target_in_cents'],
        ]);
    }
}
