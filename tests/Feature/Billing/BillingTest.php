<?php

use App\Models\Plan;
use App\Models\User;
use Creem\Laravel\Events\SubscriptionActive;
use Creem\Laravel\Events\SubscriptionCanceled;

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

test('billing page includes creem subscriber status', function () {
    $response = $this->get(route('billing.index'));
    $props = $response->original->getData()['page']['props'];

    expect($props['isCreemSubscriber'])->toBeFalse();
});

test('billing page plans include has_creem_checkout flag', function () {
    $planWithCreem = Plan::factory()->monthly()->create(['slug' => 'monthly-creem', 'creem_product_id' => 'prod_test_123']);

    $response = $this->get(route('billing.index'));
    $props = $response->original->getData()['page']['props'];

    $found = collect($props['plans'])->firstWhere('id', $planWithCreem->id);
    expect($found['has_creem_checkout'])->toBeTrue();
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

test('creem checkout requires a non-free plan', function () {
    $this->post(route('billing.creem', $this->freePlan))
        ->assertRedirect()
        ->assertSessionHasErrors('plan');
});

test('creem checkout requires creem product id configured on plan', function () {
    $planWithoutCreem = Plan::factory()->monthly()->create(['slug' => 'monthly-no-creem', 'creem_product_id' => null]);

    $this->post(route('billing.creem', $planWithoutCreem))
        ->assertRedirect()
        ->assertSessionHasErrors('plan');
});

test('creem webhook updates user plan on subscription active', function () {
    $this->monthlyPlan->update(['creem_product_id' => 'prod_monthly_test']);
    $this->user->forceFill(['creem_customer_id' => 'cus_test123'])->save();

    SubscriptionActive::dispatch([
        'id' => 'sub_test123',
        'customer_id' => 'cus_test123',
        'product_id' => 'prod_monthly_test',
        'status' => 'active',
    ]);

    $fresh = $this->user->fresh();
    expect($fresh->plan_id)->toBe($this->monthlyPlan->id)
        ->and($fresh->creem_subscription_id)->toBe('sub_test123');
});

test('creem webhook downgrades user on subscription canceled', function () {
    $this->user->forceFill([
        'creem_customer_id' => 'cus_test123',
        'creem_subscription_id' => 'sub_test123',
        'plan_id' => $this->monthlyPlan->id,
    ])->save();

    SubscriptionCanceled::dispatch([
        'id' => 'sub_test123',
        'customer_id' => 'cus_test123',
        'status' => 'canceled',
    ]);

    $fresh = $this->user->fresh();
    expect($fresh->plan_id)->toBe($this->freePlan->id)
        ->and($fresh->creem_subscription_id)->toBeNull();
});
