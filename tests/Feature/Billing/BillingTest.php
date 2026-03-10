<?php

use App\Models\Plan;
use App\Models\User;
use Laravel\Cashier\Events\WebhookReceived;

beforeEach(function () {
    $this->freePlan = Plan::factory()->create([
        'slug' => 'free',
        'interval' => 'free',
        'max_accounts' => 1,
        'max_categories' => 5,
        'has_advanced_charts' => false,
    ]);

    $this->monthlyPlan = Plan::factory()->monthly()->create();
    $this->annualPlan = Plan::factory()->annual()->create();

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

test('billing page includes stripe subscriber status', function () {
    $response = $this->get(route('billing.index'));
    $props = $response->original->getData()['page']['props'];

    expect($props['isStripeSubscriber'])->toBeFalse();
});

test('billing page plans include has_stripe_checkout flag', function () {
    $planWithStripe = Plan::factory()->monthly()->create(['slug' => 'monthly-stripe', 'stripe_price_id' => 'price_test_123']);

    $response = $this->get(route('billing.index'));
    $props = $response->original->getData()['page']['props'];

    $found = collect($props['plans'])->firstWhere('id', $planWithStripe->id);
    expect($found['has_stripe_checkout'])->toBeTrue();
});

test('unauthenticated user cannot access billing page', function () {
    auth()->logout();
    $this->get(route('billing.index'))->assertRedirect(route('login'));
});

test('checkout requires a non-free plan', function () {
    $this->post(route('billing.checkout', $this->freePlan))
        ->assertRedirect()
        ->assertSessionHasErrors('plan');
});

test('stripe checkout requires a non-free plan', function () {
    $this->post(route('billing.stripe', $this->freePlan))
        ->assertRedirect()
        ->assertSessionHasErrors('plan');
});

test('stripe checkout requires stripe price id configured on plan', function () {
    $planWithoutStripe = Plan::factory()->monthly()->create(['slug' => 'monthly-no-stripe', 'stripe_price_id' => null]);

    $this->post(route('billing.stripe', $planWithoutStripe))
        ->assertRedirect()
        ->assertSessionHasErrors('plan');
});

test('stripe webhook updates user plan on subscription created', function () {
    $this->monthlyPlan->update(['stripe_price_id' => 'price_monthly_test']);
    $this->user->forceFill(['stripe_id' => 'cus_test123'])->save();

    event(new WebhookReceived([
        'type' => 'customer.subscription.created',
        'data' => [
            'object' => [
                'customer' => 'cus_test123',
                'status' => 'active',
                'items' => [
                    'data' => [
                        ['price' => ['id' => 'price_monthly_test']],
                    ],
                ],
            ],
        ],
    ]));

    expect($this->user->fresh()->plan_id)->toBe($this->monthlyPlan->id);
});

test('stripe webhook downgrades user on subscription deleted', function () {
    $this->user->forceFill(['stripe_id' => 'cus_test123'])->save();
    $this->user->update(['plan_id' => $this->monthlyPlan->id]);

    event(new WebhookReceived([
        'type' => 'customer.subscription.deleted',
        'data' => [
            'object' => [
                'customer' => 'cus_test123',
                'status' => 'canceled',
                'items' => ['data' => []],
            ],
        ],
    ]));

    expect($this->user->fresh()->plan_id)->toBe($this->freePlan->id);
});
