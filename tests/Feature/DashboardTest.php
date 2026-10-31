<?php

use App\Models\Account;
use App\Models\Category;
use App\Models\Plan;
use App\Models\Transaction;
use App\Models\User;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});

function paidDashboardUser(array $attributes = []): User
{
    $plan = Plan::factory()->monthly()->create(['has_advanced_charts' => true]);

    return User::factory()->create([
        'plan_id' => $plan->id,
        'plan_expires_at' => now()->addMonth(),
        ...$attributes,
    ]);
}

function dashboardTransaction(User $user, string $type, int $amountInCents, string $date, ?Category $category = null): Transaction
{
    $account = $user->accounts()->first() ?? Account::factory()->create(['user_id' => $user->id]);
    $category ??= Category::factory()->{$type}()->create(['user_id' => $user->id]);

    return Transaction::factory()->{$type}()->create([
        'user_id' => $user->id,
        'account_id' => $account->id,
        'category_id' => $category->id,
        'amount_in_cents' => $amountInCents,
        'date' => $date,
    ]);
}

test('dashboard defaults to the current month', function () {
    $this->travelTo('2026-10-15');
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->where('selectedMonth', '2026-10')
            ->where('currentMonth', '2026-10'));
});

test('dashboard totals only include the selected month', function () {
    $user = User::factory()->create();
    dashboardTransaction($user, 'income', 500000, '2026-09-05');
    dashboardTransaction($user, 'expense', 120000, '2026-09-20');
    dashboardTransaction($user, 'expense', 99900, '2026-10-02');

    $this->actingAs($user)
        ->get(route('dashboard', ['month' => '2026-09']))
        ->assertInertia(fn ($page) => $page
            ->where('selectedMonth', '2026-09')
            ->where('totalIncomeInCents', 500000)
            ->where('totalExpenseInCents', 120000)
            ->has('recentTransactions', 2));
});

test('dashboard rejects an invalid month', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard', ['month' => '2026-13']))
        ->assertSessionHasErrors('month');
});

test('monthly summary covers the six months ending at the selected month', function () {
    $user = paidDashboardUser();
    dashboardTransaction($user, 'expense', 10000, '2026-04-10');
    dashboardTransaction($user, 'income', 30000, '2026-08-01');
    dashboardTransaction($user, 'expense', 20000, '2026-08-31');
    dashboardTransaction($user, 'expense', 50000, '2026-10-01');

    $this->actingAs($user)
        ->get(route('dashboard', ['month' => '2026-09']))
        ->assertInertia(fn ($page) => $page
            ->has('monthlySummary', 6)
            ->where('monthlySummary.0', ['month' => '2026-04', 'income_in_cents' => 0, 'expense_in_cents' => 10000])
            ->where('monthlySummary.4', ['month' => '2026-08', 'income_in_cents' => 30000, 'expense_in_cents' => 20000])
            ->where('monthlySummary.5', ['month' => '2026-09', 'income_in_cents' => 0, 'expense_in_cents' => 0]));
});

test('category breakdown is scoped to the selected month', function () {
    $user = paidDashboardUser();
    $market = Category::factory()->expense()->create(['user_id' => $user->id, 'name' => 'Mercado', 'color' => '#10b981']);
    dashboardTransaction($user, 'expense', 30000, '2026-09-03', $market);
    dashboardTransaction($user, 'expense', 10000, '2026-09-04');
    dashboardTransaction($user, 'expense', 90000, '2026-10-04', $market);

    $this->actingAs($user)
        ->get(route('dashboard', ['month' => '2026-09']))
        ->assertInertia(fn ($page) => $page
            ->has('categoryBreakdown', 2)
            ->where('categoryBreakdown.0.category_name', 'Mercado')
            ->where('categoryBreakdown.0.total_in_cents', 30000)
            ->where('categoryBreakdown.0.percentage', 75));
});

test('couple split is null until incomes and partner are configured', function () {
    $user = User::factory()->create(['partner_name' => 'Ana', 'own_income_in_cents' => null]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page->where('coupleSplit', null));
});

test('couple split divides expenses proportionally to income', function () {
    $user = User::factory()->create([
        'partner_name' => 'Ana',
        'own_income_in_cents' => 620000,
        'partner_income_in_cents' => 680000,
    ]);
    dashboardTransaction($user, 'expense', 100001, '2026-09-10');

    $this->actingAs($user)
        ->get(route('dashboard', ['month' => '2026-09']))
        ->assertInertia(fn ($page) => $page
            ->where('coupleSplit.partner_name', 'Ana')
            ->where('coupleSplit.own_share_percentage', 47.7)
            ->where('coupleSplit.own_share_in_cents', 47693)
            ->where('coupleSplit.partner_share_in_cents', 52308));
});
