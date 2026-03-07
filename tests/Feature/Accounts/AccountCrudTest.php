<?php

use App\Models\Account;
use App\Models\Plan;
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
    $this->actingAs($this->user);
});

test('user can view accounts page', function () {
    $this->get(route('accounts.index'))->assertOk();
});

test('user can create an account', function () {
    $this->post(route('accounts.store'), [
        'name' => 'Nubank',
        'type' => 'checking',
        'initial_balance_in_cents' => 50000,
    ])->assertRedirect();

    $this->assertDatabaseHas('accounts', [
        'user_id' => $this->user->id,
        'name' => 'Nubank',
        'initial_balance_in_cents' => 50000,
    ]);
});

test('free plan is limited to 1 account', function () {
    Account::factory()->create(['user_id' => $this->user->id]);

    $response = $this->post(route('accounts.store'), [
        'name' => 'Segunda conta',
        'type' => 'savings',
        'initial_balance_in_cents' => 0,
    ]);

    $response->assertSessionHasErrors('limit');
    expect($this->user->accounts()->count())->toBe(1);
});

test('user can update their account', function () {
    $account = Account::factory()->create(['user_id' => $this->user->id]);

    $this->put(route('accounts.update', $account), [
        'name' => 'Bradesco',
        'type' => $account->type->value,
        'initial_balance_in_cents' => $account->initial_balance_in_cents,
    ])->assertRedirect();

    expect($account->fresh()->name)->toBe('Bradesco');
});

test('user cannot update another user account', function () {
    $other = User::factory()->create();
    $account = Account::factory()->create(['user_id' => $other->id]);

    $this->put(route('accounts.update', $account), [
        'name' => 'Hacked',
        'type' => 'checking',
        'initial_balance_in_cents' => 0,
    ])->assertForbidden();
});

test('user can delete their account', function () {
    $account = Account::factory()->create(['user_id' => $this->user->id]);

    $this->delete(route('accounts.destroy', $account))->assertRedirect();

    $this->assertDatabaseMissing('accounts', ['id' => $account->id]);
});

test('user cannot delete another user account', function () {
    $other = User::factory()->create();
    $account = Account::factory()->create(['user_id' => $other->id]);

    $this->delete(route('accounts.destroy', $account))->assertForbidden();
});
