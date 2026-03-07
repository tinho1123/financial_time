<?php

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

    Plan::factory()->monthly()->create();
    Plan::factory()->annual()->create();

    $this->user = User::factory()->create(['plan_id' => $this->freePlan->id]);
    $this->actingAs($this->user);
});

test('user can view billing page', function () {
    $this->get(route('billing.index'))->assertOk();
});

test('billing page shows all plans', function () {
    $response = $this->get(route('billing.index'));
    $response->assertOk();

    $props = $response->original->getData()['page']['props'];
    expect($props['plans'])->toHaveCount(3);
});

test('billing page shows current plan', function () {
    $response = $this->get(route('billing.index'));
    $props = $response->original->getData()['page']['props'];

    expect($props['currentPlan']['id'])->toBe($this->freePlan->id);
});

test('unauthenticated user cannot access billing page', function () {
    auth()->logout();
    $this->get(route('billing.index'))->assertRedirect(route('login'));
});

test('checkout requires a non-free plan', function () {
    $this->post(route('billing.checkout', $this->freePlan))
        ->assertSessionHasErrors('plan');
});
