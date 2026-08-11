<?php

use App\Models\Account;
use App\Models\Category;
use App\Models\Plan;
use App\Models\RecurringTransaction;
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
    $this->account = Account::factory()->create(['user_id' => $this->user->id]);
    $this->category = Category::factory()->expense()->create(['user_id' => $this->user->id]);
    $this->actingAs($this->user);
});

test('user can view recurring transactions page', function () {
    $this->get(route('recurring-transactions.index'))->assertOk();
});

test('user can create a recurring transaction', function () {
    $this->post(route('recurring-transactions.store'), [
        'type' => 'expense',
        'account_id' => $this->account->id,
        'category_id' => $this->category->id,
        'amount_in_cents' => '49.90',
        'description' => 'Assinatura streaming',
        'notes' => null,
        'frequency' => 'monthly',
        'start_date' => '2026-04-01',
        'end_date' => null,
    ])->assertRedirect();

    $recurring = RecurringTransaction::where('user_id', $this->user->id)->first();
    expect($recurring)->not->toBeNull();
    expect($recurring->amount_in_cents)->toBe(4990);
    expect($recurring->frequency)->toBe(App\Enums\RecurringFrequency::Monthly);
    expect($recurring->next_due_date->format('Y-m-d'))->toBe('2026-04-01');
    expect($recurring->is_active)->toBeTrue();
});

test('end date before start date is rejected', function () {
    $this->post(route('recurring-transactions.store'), [
        'type' => 'expense',
        'account_id' => $this->account->id,
        'category_id' => null,
        'amount_in_cents' => '10.00',
        'description' => 'Teste',
        'notes' => null,
        'frequency' => 'weekly',
        'start_date' => '2026-04-10',
        'end_date' => '2026-04-01',
    ])->assertSessionHasErrors('end_date');
});

test('user cannot store recurring transaction for another user account', function () {
    $other = User::factory()->create();
    $otherAccount = Account::factory()->create(['user_id' => $other->id]);

    $this->post(route('recurring-transactions.store'), [
        'type' => 'expense',
        'account_id' => $otherAccount->id,
        'category_id' => null,
        'amount_in_cents' => '10.00',
        'description' => 'Hack',
        'notes' => null,
        'frequency' => 'weekly',
        'start_date' => '2026-04-01',
        'end_date' => null,
    ])->assertSessionHasErrors('account_id');
});

test('user can update a recurring transaction and pause it', function () {
    $recurring = RecurringTransaction::factory()->create([
        'user_id' => $this->user->id,
        'account_id' => $this->account->id,
        'category_id' => $this->category->id,
        'is_active' => true,
    ]);

    $this->put(route('recurring-transactions.update', $recurring), [
        'type' => 'expense',
        'category_id' => $this->category->id,
        'amount_in_cents' => '99.90',
        'description' => 'Assinatura atualizada',
        'notes' => null,
        'frequency' => 'monthly',
        'end_date' => null,
        'is_active' => false,
    ])->assertRedirect();

    $recurring->refresh();
    expect($recurring->amount_in_cents)->toBe(9990);
    expect($recurring->description)->toBe('Assinatura atualizada');
    expect($recurring->is_active)->toBeFalse();
});

test('user cannot update another user recurring transaction', function () {
    $other = User::factory()->create();
    $otherAccount = Account::factory()->create(['user_id' => $other->id]);
    $recurring = RecurringTransaction::factory()->create([
        'user_id' => $other->id,
        'account_id' => $otherAccount->id,
    ]);

    $this->put(route('recurring-transactions.update', $recurring), [
        'type' => 'expense',
        'category_id' => null,
        'amount_in_cents' => '10.00',
        'description' => 'Hack',
        'notes' => null,
        'frequency' => 'weekly',
        'end_date' => null,
        'is_active' => false,
    ])->assertForbidden();
});

test('user can delete their recurring transaction', function () {
    $recurring = RecurringTransaction::factory()->create([
        'user_id' => $this->user->id,
        'account_id' => $this->account->id,
    ]);

    $this->delete(route('recurring-transactions.destroy', $recurring))->assertRedirect();

    $this->assertDatabaseMissing('recurring_transactions', ['id' => $recurring->id]);
});

test('user cannot delete another user recurring transaction', function () {
    $other = User::factory()->create();
    $otherAccount = Account::factory()->create(['user_id' => $other->id]);
    $recurring = RecurringTransaction::factory()->create([
        'user_id' => $other->id,
        'account_id' => $otherAccount->id,
    ]);

    $this->delete(route('recurring-transactions.destroy', $recurring))->assertForbidden();
});

test('deleting a recurring transaction keeps previously generated transactions', function () {
    $recurring = RecurringTransaction::factory()->create([
        'user_id' => $this->user->id,
        'account_id' => $this->account->id,
    ]);

    $transaction = \App\Models\Transaction::factory()->create([
        'user_id' => $this->user->id,
        'account_id' => $this->account->id,
        'recurring_transaction_id' => $recurring->id,
    ]);

    $this->delete(route('recurring-transactions.destroy', $recurring));

    expect($transaction->fresh()->recurring_transaction_id)->toBeNull();
    $this->assertDatabaseHas('transactions', ['id' => $transaction->id]);
});
