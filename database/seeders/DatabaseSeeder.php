<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\Category;
use App\Models\Plan;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $freePlan = Plan::factory()->create();
        Plan::factory()->monthly()->create();
        Plan::factory()->annual()->create();

        $user = User::factory()->create([
            'name' => 'Wellington',
            'email' => 'demo@financetime.com',
            'password' => bcrypt('123456'),
            'plan_id' => $freePlan->id,
        ]);

        $account = Account::factory()->create([
            'user_id' => $user->id,
            'name' => 'Nubank',
            'type' => 'checking',
            'initial_balance_in_cents' => 0,
        ]);

        $incomeCategories = collect([
            ['name' => 'Salário', 'color' => '#10b981'],
            ['name' => 'Freelance', 'color' => '#6366f1'],
        ])->map(fn ($data) => Category::factory()->create([
            'user_id' => $user->id,
            'name' => $data['name'],
            'type' => 'income',
            'color' => $data['color'],
        ]));

        $expenseCategories = collect([
            ['name' => 'Alimentação', 'color' => '#ef4444'],
            ['name' => 'Transporte', 'color' => '#f59e0b'],
            ['name' => 'Moradia', 'color' => '#3b82f6'],
        ])->map(fn ($data) => Category::factory()->create([
            'user_id' => $user->id,
            'name' => $data['name'],
            'type' => 'expense',
            'color' => $data['color'],
        ]));

        $balance = 0;

        for ($i = 0; $i < 50; $i++) {
            $type = fake()->randomElement(['income', 'expense']);
            $category = $type === 'income'
                ? $incomeCategories->random()
                : $expenseCategories->random();
            $amount = fake()->numberBetween(1000, 50000);
            $previous = $balance;
            $balance = $type === 'income' ? $balance + $amount : $balance - $amount;

            Transaction::factory()->create([
                'user_id' => $user->id,
                'account_id' => $account->id,
                'category_id' => $category->id,
                'type' => $type,
                'amount_in_cents' => $amount,
                'previous_balance_in_cents' => $previous,
                'current_balance_in_cents' => $balance,
                'date' => fake()->dateTimeBetween('-3 months', 'now')->format('Y-m-d'),
            ]);
        }
    }
}
