<?php

use App\Models\Account;
use App\Models\Budget;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use App\Services\BudgetService;
use Illuminate\Support\Carbon;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->account = Account::factory()->create(['user_id' => $this->user->id]);
    $this->category = Category::factory()->expense()->create(['user_id' => $this->user->id]);
    $this->service = app(BudgetService::class);
});

test('spent only sums expense transactions in the given month for the budgeted category', function () {
    $budget = Budget::factory()->create([
        'user_id' => $this->user->id,
        'category_id' => $this->category->id,
        'amount_in_cents' => 100000,
    ]);

    Transaction::factory()->expense()->create([
        'user_id' => $this->user->id,
        'account_id' => $this->account->id,
        'category_id' => $this->category->id,
        'amount_in_cents' => 20000,
        'date' => '2026-04-10',
    ]);
    Transaction::factory()->expense()->create([
        'user_id' => $this->user->id,
        'account_id' => $this->account->id,
        'category_id' => $this->category->id,
        'amount_in_cents' => 15000,
        'date' => '2026-04-25',
    ]);

    // outside the target month, must be excluded.
    Transaction::factory()->expense()->create([
        'user_id' => $this->user->id,
        'account_id' => $this->account->id,
        'category_id' => $this->category->id,
        'amount_in_cents' => 999999,
        'date' => '2026-05-01',
    ]);

    // income in the same category/month must be excluded.
    Transaction::factory()->income()->create([
        'user_id' => $this->user->id,
        'account_id' => $this->account->id,
        'category_id' => $this->category->id,
        'amount_in_cents' => 500000,
        'date' => '2026-04-15',
    ]);

    // a different category in the same month must be excluded.
    $otherCategory = Category::factory()->expense()->create(['user_id' => $this->user->id]);
    Transaction::factory()->expense()->create([
        'user_id' => $this->user->id,
        'account_id' => $this->account->id,
        'category_id' => $otherCategory->id,
        'amount_in_cents' => 777,
        'date' => '2026-04-12',
    ]);

    $spent = $this->service->spentInCents($budget, Carbon::parse('2026-04-15'));

    expect($spent)->toBe(35000);
});

test('percentage spent is calculated relative to the budget amount and can exceed 100', function () {
    $budget = Budget::factory()->create([
        'user_id' => $this->user->id,
        'category_id' => $this->category->id,
        'amount_in_cents' => 40000,
    ]);

    expect($this->service->percentageSpent($budget, 20000))->toBe(50);
    expect($this->service->percentageSpent($budget, 40000))->toBe(100);
    expect($this->service->percentageSpent($budget, 60000))->toBe(150);
    expect($this->service->percentageSpent($budget, 0))->toBe(0);
});

test('budgets index returns spent and percentage per budget', function () {
    $budget = Budget::factory()->create([
        'user_id' => $this->user->id,
        'category_id' => $this->category->id,
        'amount_in_cents' => 10000,
    ]);

    Transaction::factory()->expense()->create([
        'user_id' => $this->user->id,
        'account_id' => $this->account->id,
        'category_id' => $this->category->id,
        'amount_in_cents' => 12000,
        'date' => Carbon::today()->format('Y-m-d'),
    ]);

    $this->actingAs($this->user);
    $response = $this->get(route('budgets.index'));

    $props = $response->original->getData()['page']['props'];
    $data = collect($props['budgets'])->firstWhere('id', $budget->id);

    expect($data['spent_in_cents'])->toBe(12000);
    expect($data['percentage'])->toBe(120);
});
