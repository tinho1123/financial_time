<?php

namespace App\Listeners;

use App\Enums\PlanInterval;
use App\Models\Plan;
use App\Models\User;
use Laravel\Cashier\Events\WebhookReceived;

class StripeEventListener
{
    public function handle(WebhookReceived $event): void
    {
        match ($event->payload['type'] ?? '') {
            'customer.subscription.created',
            'customer.subscription.updated' => $this->handleSubscriptionUpdated($event->payload['data']['object']),
            'customer.subscription.deleted' => $this->handleSubscriptionDeleted($event->payload['data']['object']),
            default => null,
        };
    }

    private function handleSubscriptionUpdated(array $subscription): void
    {
        if ($subscription['status'] !== 'active') {
            return;
        }

        $priceId = $subscription['items']['data'][0]['price']['id'] ?? null;

        if (! $priceId) {
            return;
        }

        $user = User::query()->where('stripe_id', $subscription['customer'])->first();

        if (! $user) {
            return;
        }

        $plan = Plan::query()
            ->where('stripe_price_id', $priceId)
            ->orWhere('stripe_promo_price_id', $priceId)
            ->first();

        if ($plan) {
            $user->update(['plan_id' => $plan->id, 'plan_expires_at' => null]);
        }
    }

    private function handleSubscriptionDeleted(array $subscription): void
    {
        $user = User::query()->where('stripe_id', $subscription['customer'])->first();

        if (! $user) {
            return;
        }

        $freePlan = Plan::query()->where('interval', PlanInterval::Free)->first();
        $user->update(['plan_id' => $freePlan?->id, 'plan_expires_at' => null]);
    }
}
