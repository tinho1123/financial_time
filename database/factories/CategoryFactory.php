<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Category>
 */
class CategoryFactory extends Factory
{
    private static array $incomeNames = ['Salário', 'Freelance', 'Investimentos', 'Aluguel Recebido', 'Bônus'];

    private static array $expenseNames = ['Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Lazer', 'Educação', 'Roupas', 'Serviços'];

    private static array $colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

    public function definition(): array
    {
        $type = fake()->randomElement(['income', 'expense']);
        $names = $type === 'income' ? self::$incomeNames : self::$expenseNames;

        return [
            'user_id' => User::factory(),
            'name' => fake()->unique()->randomElement($names),
            'type' => $type,
            'color' => fake()->randomElement(self::$colors),
        ];
    }

    public function income(): static
    {
        return $this->state(fn () => [
            'type' => 'income',
            'name' => fake()->unique()->randomElement(self::$incomeNames),
        ]);
    }

    public function expense(): static
    {
        return $this->state(fn () => [
            'type' => 'expense',
            'name' => fake()->unique()->randomElement(self::$expenseNames),
        ]);
    }
}
