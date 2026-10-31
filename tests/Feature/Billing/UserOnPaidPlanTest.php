<?php

use App\Models\Plan;
use App\Models\User;

test('a plan assigned directly without an expiration date is honored with no deadline', function () {
    $plan = Plan::factory()->monthly()->create(['has_advanced_charts' => true]);
    $user = User::factory()->create([
        'plan_id' => $plan->id,
        'plan_expires_at' => null,
    ]);

    expect($user->onPaidPlan())->toBeTrue();
});

test('a PIX-purchased plan is honored until its expiration date', function () {
    $plan = Plan::factory()->monthly()->create(['has_advanced_charts' => true]);
    $user = User::factory()->create([
        'plan_id' => $plan->id,
        'plan_expires_at' => now()->addDays(10),
    ]);

    expect($user->onPaidPlan())->toBeTrue();
});

test('a PIX-purchased plan stops being honored once it expires', function () {
    $plan = Plan::factory()->monthly()->create(['has_advanced_charts' => true]);
    $user = User::factory()->create([
        'plan_id' => $plan->id,
        'plan_expires_at' => now()->subDay(),
    ]);

    expect($user->onPaidPlan())->toBeFalse();
});

test('an active Creem subscription is honored regardless of plan_expires_at', function () {
    $freePlan = Plan::factory()->create(['has_advanced_charts' => false]);
    $user = User::factory()->create([
        'plan_id' => $freePlan->id,
        'plan_expires_at' => null,
        'creem_subscription_id' => 'sub_123',
    ]);

    expect($user->onPaidPlan())->toBeTrue();
});

test('the free plan is never honored as paid', function () {
    $freePlan = Plan::factory()->create(['has_advanced_charts' => false]);
    $user = User::factory()->create([
        'plan_id' => $freePlan->id,
        'plan_expires_at' => null,
    ]);

    expect($user->onPaidPlan())->toBeFalse();
});
