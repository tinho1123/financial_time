<?php

use App\Models\User;

test('couple split settings page is displayed', function () {
    $user = User::factory()->create(['partner_name' => 'Ana', 'own_income_in_cents' => 620000]);

    $this->actingAs($user)
        ->get(route('couple-split.edit'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('settings/couple-split')
            ->where('partnerName', 'Ana')
            ->where('ownIncomeInCents', 620000)
            ->where('partnerIncomeInCents', null));
});

test('couple split settings can be saved', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->put(route('couple-split.update'), [
            'partner_name' => 'Ana',
            'own_income_in_cents' => '6200,00',
            'partner_income_in_cents' => '6800.50',
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('couple-split.edit'));

    $user->refresh();
    expect($user->partner_name)->toBe('Ana');
    expect($user->own_income_in_cents)->toBe(620000);
    expect($user->partner_income_in_cents)->toBe(680050);
    expect($user->hasCoupleSplit())->toBeTrue();
});

test('incomes are required when a partner is informed', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->put(route('couple-split.update'), ['partner_name' => 'Ana'])
        ->assertSessionHasErrors(['own_income_in_cents', 'partner_income_in_cents']);
});

test('couple split can be disabled by clearing the fields', function () {
    $user = User::factory()->create([
        'partner_name' => 'Ana',
        'own_income_in_cents' => 620000,
        'partner_income_in_cents' => 680000,
    ]);

    $this->actingAs($user)
        ->put(route('couple-split.update'), [
            'partner_name' => '',
            'own_income_in_cents' => '',
            'partner_income_in_cents' => '',
        ])
        ->assertSessionHasNoErrors();

    expect($user->refresh()->hasCoupleSplit())->toBeFalse();
});

test('couple split is not active when both incomes are zero', function () {
    $user = User::factory()->make([
        'partner_name' => 'Ana',
        'own_income_in_cents' => 0,
        'partner_income_in_cents' => 0,
    ]);

    expect($user->hasCoupleSplit())->toBeFalse();
});
