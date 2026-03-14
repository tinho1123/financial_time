<?php

use App\Models\Account;
use App\Models\Category;
use App\Models\Plan;
use App\Models\Transaction;
use App\Models\User;

beforeEach(function () {
    $this->freePlan = Plan::factory()->create([
        'slug' => 'free',
        'interval' => 'free',
        'max_accounts' => 1,
        'max_categories' => 5,
        'has_advanced_charts' => false,
    ]);

    $this->user = User::factory()->create(['plan_id' => $this->freePlan->id]);
    $this->account = Account::factory()->create([
        'user_id' => $this->user->id,
        'initial_balance_in_cents' => 0,
    ]);
    $this->category = Category::factory()->expense()->create(['user_id' => $this->user->id]);
    $this->actingAs($this->user);
});

test('user can view transactions page', function () {
    $this->get(route('transactions.index'))->assertOk();
});

test('user can create an income transaction', function () {
    $this->post(route('transactions.store'), [
        'type' => 'income',
        'account_id' => $this->account->id,
        'category_id' => null,
        'amount_in_cents' => '1000.00',
        'description' => 'Salário',
        'date' => '2026-03-01',
        'notes' => null,
    ])->assertRedirect();

    $transaction = Transaction::where('user_id', $this->user->id)->first();
    expect($transaction)->not->toBeNull();
    expect($transaction->amount_in_cents)->toBe(100000);
    expect($transaction->previous_balance_in_cents)->toBe(0);
    expect($transaction->current_balance_in_cents)->toBe(100000);
});

test('user can create an expense transaction and balance decreases', function () {
    Transaction::factory()->income()->create([
        'user_id' => $this->user->id,
        'account_id' => $this->account->id,
        'amount_in_cents' => 100000,
        'previous_balance_in_cents' => 0,
        'current_balance_in_cents' => 100000,
        'date' => '2026-03-01',
    ]);

    $this->post(route('transactions.store'), [
        'type' => 'expense',
        'account_id' => $this->account->id,
        'category_id' => $this->category->id,
        'amount_in_cents' => '30.00',
        'description' => 'Almoço',
        'date' => '2026-03-02',
        'notes' => null,
    ])->assertRedirect();

    $expense = Transaction::where('description', 'Almoço')->first();
    expect($expense->previous_balance_in_cents)->toBe(100000);
    expect($expense->current_balance_in_cents)->toBe(97000);
});

test('user cannot access another user transactions', function () {
    $other = User::factory()->create();
    $otherAccount = Account::factory()->create(['user_id' => $other->id]);
    Transaction::factory()->create([
        'user_id' => $other->id,
        'account_id' => $otherAccount->id,
    ]);

    $response = $this->get(route('transactions.index'));
    $response->assertOk();

    $props = $response->original->getData()['page']['props'];
    expect(collect($props['transactions']['data'])->pluck('user_id')->every(fn ($id) => $id === $this->user->id))->toBeTrue();
});

test('user cannot store transaction for another user account', function () {
    $other = User::factory()->create();
    $otherAccount = Account::factory()->create(['user_id' => $other->id]);

    $this->post(route('transactions.store'), [
        'type' => 'expense',
        'account_id' => $otherAccount->id,
        'category_id' => null,
        'amount_in_cents' => '50.00',
        'description' => 'Hack',
        'date' => '2026-03-01',
        'notes' => null,
    ])->assertSessionHasErrors('account_id');
});

test('user can delete their transaction', function () {
    $transaction = Transaction::factory()->create([
        'user_id' => $this->user->id,
        'account_id' => $this->account->id,
    ]);

    $this->delete(route('transactions.destroy', $transaction))->assertRedirect();

    $this->assertDatabaseMissing('transactions', ['id' => $transaction->id]);
});

test('user cannot delete another user transaction', function () {
    $other = User::factory()->create();
    $otherAccount = Account::factory()->create(['user_id' => $other->id]);
    $transaction = Transaction::factory()->create([
        'user_id' => $other->id,
        'account_id' => $otherAccount->id,
    ]);

    $this->delete(route('transactions.destroy', $transaction))->assertForbidden();
});
