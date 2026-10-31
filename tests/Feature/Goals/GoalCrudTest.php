<?php

use App\Models\Goal;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

test('guests cannot access goals', function () {
    auth()->logout();

    $this->get(route('goals.index'))->assertRedirect(route('login'));
});

test('user sees only their own goals with totals', function () {
    Goal::factory()->create(['user_id' => $this->user->id, 'target_in_cents' => 100000, 'saved_in_cents' => 25000]);
    Goal::factory()->create(['user_id' => $this->user->id, 'target_in_cents' => 300000, 'saved_in_cents' => 0]);
    Goal::factory()->create();

    $this->get(route('goals.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('goals/index')
            ->has('goals', 2)
            ->where('goals.0.percentage', 25)
            ->where('totalTargetInCents', 400000)
            ->where('totalSavedInCents', 25000));
});

test('user can create a goal with decimal amounts', function () {
    $this->post(route('goals.store'), [
        'name' => 'Reserva de emergência',
        'target_in_cents' => '30000,00',
        'saved_in_cents' => '1500.50',
        'deadline' => now()->addYear()->format('Y-m-d'),
    ])->assertRedirect()->assertSessionHasNoErrors();

    $goal = $this->user->goals()->sole();
    expect($goal->name)->toBe('Reserva de emergência');
    expect($goal->target_in_cents)->toBe(3000000);
    expect($goal->saved_in_cents)->toBe(150050);
});

test('saved amount defaults to zero', function () {
    $this->post(route('goals.store'), [
        'name' => 'Viagem',
        'target_in_cents' => '5000',
    ])->assertSessionHasNoErrors();

    expect($this->user->goals()->sole()->saved_in_cents)->toBe(0);
});

test('goal requires a name and a positive target', function () {
    $this->post(route('goals.store'), [
        'name' => '',
        'target_in_cents' => '0',
    ])->assertSessionHasErrors(['name', 'target_in_cents']);
});

test('new goal deadline cannot be in the past', function () {
    $this->post(route('goals.store'), [
        'name' => 'Viagem',
        'target_in_cents' => '5000',
        'deadline' => now()->subDay()->format('Y-m-d'),
    ])->assertSessionHasErrors('deadline');
});

test('user can update their goal', function () {
    $goal = Goal::factory()->create(['user_id' => $this->user->id]);

    $this->put(route('goals.update', $goal), [
        'name' => 'Carro novo',
        'target_in_cents' => '45000',
        'saved_in_cents' => '1000',
    ])->assertSessionHasNoErrors();

    $goal->refresh();
    expect($goal->name)->toBe('Carro novo');
    expect($goal->target_in_cents)->toBe(4500000);
    expect($goal->saved_in_cents)->toBe(100000);
});

test('user can add and withdraw money from a goal', function () {
    $goal = Goal::factory()->create(['user_id' => $this->user->id, 'saved_in_cents' => 10000]);

    $this->post(route('goals.contribute', $goal), ['amount_in_cents' => '250,00'])->assertSessionHasNoErrors();
    expect($goal->refresh()->saved_in_cents)->toBe(35000);

    $this->post(route('goals.contribute', $goal), ['amount_in_cents' => '-50'])->assertSessionHasNoErrors();
    expect($goal->refresh()->saved_in_cents)->toBe(30000);
});

test('withdrawing more than saved leaves the goal at zero', function () {
    $goal = Goal::factory()->create(['user_id' => $this->user->id, 'saved_in_cents' => 10000]);

    $this->post(route('goals.contribute', $goal), ['amount_in_cents' => '-500']);

    expect($goal->refresh()->saved_in_cents)->toBe(0);
});

test('contribution must not be zero', function () {
    $goal = Goal::factory()->create(['user_id' => $this->user->id]);

    $this->post(route('goals.contribute', $goal), ['amount_in_cents' => '0'])
        ->assertSessionHasErrors('amount_in_cents');
});

test('percentage is capped at one hundred', function () {
    $goal = Goal::factory()->create(['target_in_cents' => 1000, 'saved_in_cents' => 5000]);

    expect($goal->percentage)->toEqual(100);
});

test('user cannot change another users goal', function () {
    $goal = Goal::factory()->create();

    $this->put(route('goals.update', $goal), ['name' => 'X', 'target_in_cents' => '10'])->assertForbidden();
    $this->post(route('goals.contribute', $goal), ['amount_in_cents' => '10'])->assertForbidden();
    $this->delete(route('goals.destroy', $goal))->assertForbidden();

    expect($goal->fresh())->not->toBeNull();
});

test('user can delete their goal', function () {
    $goal = Goal::factory()->create(['user_id' => $this->user->id]);

    $this->delete(route('goals.destroy', $goal))->assertRedirect();

    expect(Goal::find($goal->id))->toBeNull();
});
