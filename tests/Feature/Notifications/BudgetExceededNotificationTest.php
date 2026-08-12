<?php

use App\Models\Account;
use App\Models\Budget;
use App\Models\Category;
use App\Models\Plan;
use App\Models\User;
use App\Notifications\BudgetExceededNotification;
use Illuminate\Support\Facades\Notification;

beforeEach(function () {
    $plan = Plan::factory()->create(['slug' => 'free', 'interval' => 'free']);
    $this->user = User::factory()->create(['plan_id' => $plan->id]);
    $this->account = Account::factory()->create(['user_id' => $this->user->id]);
    $this->category = Category::factory()->expense()->create(['user_id' => $this->user->id]);
    Budget::factory()->create([
        'user_id' => $this->user->id,
        'category_id' => $this->category->id,
        'amount_in_cents' => 10000,
    ]);
    $this->actingAs($this->user);
});

test('a transaction that crosses the budget fires a notification', function () {
    Notification::fake();

    $this->post(route('transactions.store'), [
        'type' => 'expense',
        'account_id' => $this->account->id,
        'category_id' => $this->category->id,
        'amount_in_cents' => '150.00',
        'description' => 'Estourou o orçamento',
        'date' => now()->format('Y-m-d'),
        'notes' => null,
    ]);

    Notification::assertSentTo($this->user, BudgetExceededNotification::class);
});

test('a second transaction already over budget does not fire a duplicate notification', function () {
    Notification::fake();

    $this->post(route('transactions.store'), [
        'type' => 'expense',
        'account_id' => $this->account->id,
        'category_id' => $this->category->id,
        'amount_in_cents' => '150.00',
        'description' => 'Primeira',
        'date' => now()->format('Y-m-d'),
        'notes' => null,
    ]);

    $this->post(route('transactions.store'), [
        'type' => 'expense',
        'account_id' => $this->account->id,
        'category_id' => $this->category->id,
        'amount_in_cents' => '10.00',
        'description' => 'Segunda',
        'date' => now()->format('Y-m-d'),
        'notes' => null,
    ]);

    Notification::assertSentToTimes($this->user, BudgetExceededNotification::class, 1);
});

test('a transaction that stays under budget does not fire a notification', function () {
    Notification::fake();

    $this->post(route('transactions.store'), [
        'type' => 'expense',
        'account_id' => $this->account->id,
        'category_id' => $this->category->id,
        'amount_in_cents' => '50.00',
        'description' => 'Dentro do limite',
        'date' => now()->format('Y-m-d'),
        'notes' => null,
    ]);

    Notification::assertNotSentTo($this->user, BudgetExceededNotification::class);
});

test('an income transaction never triggers a budget notification', function () {
    Notification::fake();

    $this->post(route('transactions.store'), [
        'type' => 'income',
        'account_id' => $this->account->id,
        'category_id' => null,
        'amount_in_cents' => '999.00',
        'description' => 'Salário',
        'date' => now()->format('Y-m-d'),
        'notes' => null,
    ]);

    Notification::assertNothingSent();
});

test('a category without a budget never triggers a notification', function () {
    Notification::fake();

    $otherCategory = Category::factory()->expense()->create(['user_id' => $this->user->id]);

    $this->post(route('transactions.store'), [
        'type' => 'expense',
        'account_id' => $this->account->id,
        'category_id' => $otherCategory->id,
        'amount_in_cents' => '999.00',
        'description' => 'Sem orçamento',
        'date' => now()->format('Y-m-d'),
        'notes' => null,
    ]);

    Notification::assertNothingSent();
});
