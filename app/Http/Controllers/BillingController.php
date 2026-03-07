<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BillingController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $plans = Plan::query()->orderBy('price_in_cents')->get();

        return Inertia::render('billing/index', [
            'plans' => $plans,
            'currentPlan' => $user->plan,
            'isSubscribed' => $user->subscribed(),
            'onGracePeriod' => $user->subscribed() && $user->subscription()->onGracePeriod(),
        ]);
    }

    public function checkout(Request $request, Plan $plan): RedirectResponse
    {
        $user = $request->user();

        if ($plan->interval->value === 'free') {
            return back()->withErrors(['plan' => 'Plano gratuito não requer checkout.']);
        }

        if ($plan->promo_price_in_cents && $plan->stripe_promo_price_id && $plan->stripe_price_id) {
            $checkout = $user->newSubscription('default', $plan->stripe_promo_price_id)
                ->anchorBillingCycleOn(now()->startOfMonth())
                ->checkout([
                    'success_url' => route('billing.success'),
                    'cancel_url' => route('billing.index'),
                ]);
        } else {
            $checkout = $user->newSubscription('default', $plan->stripe_price_id)
                ->checkout([
                    'success_url' => route('billing.success'),
                    'cancel_url' => route('billing.index'),
                ]);
        }

        return redirect($checkout->url);
    }

    public function success(Request $request): Response
    {
        $user = $request->user();

        if ($user->subscribed()) {
            $plan = Plan::query()->where('slug', '!=', 'free')->first();
            if ($plan) {
                $user->update(['plan_id' => $plan->id]);
            }
        }

        return Inertia::render('billing/success');
    }

    public function portal(Request $request): RedirectResponse
    {
        return $request->user()->redirectToBillingPortal(route('billing.index'));
    }
}
