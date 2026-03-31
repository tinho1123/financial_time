<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Plan>
 */
class PlanFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => 'Grátis',
            'slug' => 'free',
            'price_in_cents' => 0,
            'promo_price_in_cents' => null,
            'promo_months' => null,
            'interval' => 'free',
            'max_accounts' => 1,
            'max_categories' => 5,
            'has_advanced_charts' => false,
            'creem_product_id' => null,
        ];
    }

    public function monthly(): static
    {
        return $this->state([
            'name' => 'Mensal',
            'slug' => 'monthly',
            'price_in_cents' => 1999,
            'promo_price_in_cents' => 999,
            'promo_months' => 3,
            'interval' => 'monthly',
            'max_accounts' => null,
            'max_categories' => null,
            'has_advanced_charts' => true,
        ]);
    }

    public function annual(): static
    {
        return $this->state([
            'name' => 'Anual',
            'slug' => 'annual',
            'price_in_cents' => 11999,
            'promo_price_in_cents' => null,
            'promo_months' => null,
            'interval' => 'annual',
            'max_accounts' => null,
            'max_categories' => null,
            'has_advanced_charts' => true,
        ]);
    }
}
