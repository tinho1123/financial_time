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

test('user can view investments page', function () {
    $this->get(route('investments.index'))->assertOk();
});

test('user can create an investment', function () {
    $this->post(route('investments.store'), [
        'name' => 'Tesouro Selic',
        'currency' => 'BRL',
        'initial_balance_in_cents' => '1000.00',
    ])->assertRedirect();

    $this->assertDatabaseHas('accounts', [
        'user_id' => $this->user->id,
        'name' => 'Tesouro Selic',
        'type' => 'investment',
        'initial_balance_in_cents' => 100000,
    ]);
});

test('investments share the free plan account limit with regular accounts', function () {
    Account::factory()->investment()->create(['user_id' => $this->user->id]);

    $response = $this->post(route('investments.store'), [
        'name' => 'Segundo investimento',
        'currency' => 'BRL',
        'initial_balance_in_cents' => '0.00',
    ]);

    $response->assertSessionHasErrors('limit');
    expect($this->user->accounts()->count())->toBe(1);
});

test('investments do not appear on the regular accounts page', function () {
    Account::factory()->investment()->create(['user_id' => $this->user->id, 'name' => 'Tesouro Selic']);
    Account::factory()->create(['user_id' => $this->user->id, 'type' => 'checking', 'name' => 'Nubank']);

    $response = $this->get(route('accounts.index'));
    $response->assertOk();

    $props = $response->original->getData()['page']['props'];
    expect(collect($props['accounts'])->pluck('name'))->not->toContain('Tesouro Selic');
});

test('regular accounts do not appear on the investments page', function () {
    Account::factory()->investment()->create(['user_id' => $this->user->id, 'name' => 'Tesouro Selic']);
    Account::factory()->create(['user_id' => $this->user->id, 'type' => 'checking', 'name' => 'Nubank']);

    $response = $this->get(route('investments.index'));
    $response->assertOk();

    $props = $response->original->getData()['page']['props'];
    expect(collect($props['investments'])->pluck('name'))->not->toContain('Nubank');
});

test('user can update their investment', function () {
    $investment = Account::factory()->investment()->create(['user_id' => $this->user->id]);

    $this->put(route('investments.update', $investment), [
        'name' => 'CDB Banco Inter',
        'currency' => 'BRL',
        'initial_balance_in_cents' => number_format($investment->initial_balance_in_cents / 100, 2, '.', ''),
    ])->assertRedirect();

    expect($investment->fresh()->name)->toBe('CDB Banco Inter');
});

test('user cannot update another user investment', function () {
    $other = User::factory()->create();
    $investment = Account::factory()->investment()->create(['user_id' => $other->id]);

    $this->put(route('investments.update', $investment), [
        'name' => 'Hacked',
        'currency' => 'BRL',
        'initial_balance_in_cents' => '0.00',
    ])->assertForbidden();
});

test('user cannot manage a regular account through the investments endpoint', function () {
    $account = Account::factory()->create(['user_id' => $this->user->id, 'type' => 'checking']);

    $this->put(route('investments.update', $account), [
        'name' => 'Hacked',
        'currency' => 'BRL',
        'initial_balance_in_cents' => '0.00',
    ])->assertNotFound();
});

test('user can delete their investment', function () {
    $investment = Account::factory()->investment()->create(['user_id' => $this->user->id]);

    $this->delete(route('investments.destroy', $investment))->assertRedirect();

    $this->assertDatabaseMissing('accounts', ['id' => $investment->id]);
});

test('user cannot delete another user investment', function () {
    $other = User::factory()->create();
    $investment = Account::factory()->investment()->create(['user_id' => $other->id]);

    $this->delete(route('investments.destroy', $investment))->assertForbidden();
});
