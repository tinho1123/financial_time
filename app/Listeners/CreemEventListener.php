<?php

namespace App\Listeners;

use App\Enums\PlanInterval;
use App\Models\Plan;
use App\Models\User;
use Creem\Laravel\Events\CheckoutCompleted;
use Creem\Laravel\Events\SubscriptionActive;
use Creem\Laravel\Events\SubscriptionCanceled;

class CreemEventListener
{
    public function handleCheckoutCompleted(CheckoutCompleted $event): void
    {
        $payload = $event->payload;

        $modelId = $payload['metadata']['model_id'] ?? null;
        $customerId = $payload['customer']['id'] ?? $payload['customer_id'] ?? null;

        if (! $modelId || ! $customerId) {
            return;
        }

        $user = User::find($modelId);
        $user?->update(['creem_customer_id' => $customerId]);
    }

    public function handleSubscriptionActive(SubscriptionActive $event): void
    {
        $payload = $event->payload;

        $subscriptionId = $payload['id'] ?? null;
        $customerId = $payload['customer_id'] ?? null;
        $productId = $payload['product_id'] ?? null;

        if (! $customerId || ! $productId || ! $subscriptionId) {
            return;
        }

        $user = User::query()->where('creem_customer_id', $customerId)->first();

        if (! $user) {
            return;
        }

        $plan = Plan::query()->where('creem_product_id', $productId)->first();

        if ($plan) {
            $user->update([
                'plan_id' => $plan->id,
                'plan_expires_at' => null,
                'creem_subscription_id' => $subscriptionId,
            ]);
        }
    }

    public function handleSubscriptionCanceled(SubscriptionCanceled $event): void
    {
        $payload = $event->payload;

        $customerId = $payload['customer_id'] ?? null;

        if (! $customerId) {
            return;
        }

        $user = User::query()->where('creem_customer_id', $customerId)->first();

        if (! $user) {
            return;
        }

        $freePlan = Plan::query()->where('interval', PlanInterval::Free)->first();
        $user->update([
            'plan_id' => $freePlan?->id,
            'plan_expires_at' => null,
            'creem_subscription_id' => null,
        ]);
    }
}
