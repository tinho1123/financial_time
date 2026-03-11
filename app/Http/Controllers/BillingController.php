<?php

namespace App\Http\Controllers;

use App\Enums\PlanInterval;
use App\Models\PixPayment;
use App\Models\Plan;
use App\Services\MercadoPagoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BillingController extends Controller
{
    public function __construct(private readonly MercadoPagoService $mercadoPagoService) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $plans = Plan::query()->orderBy('price_in_cents')->get();

        return Inertia::render('billing/index', [
            'plans' => $plans->map(fn (Plan $plan) => array_merge($plan->toArray(), [
                'has_stripe_checkout' => ! empty($plan->stripe_price_id),
            ])),
            'currentPlan' => $user->plan,
            'planExpiresAt' => $user->plan_expires_at?->toDateString(),
            'isPaidPlan' => $user->onPaidPlan(),
            'isStripeSubscriber' => $user->subscribed('default'),
        ]);
    }

    public function checkout(Request $request, Plan $plan): RedirectResponse
    {
        $user = $request->user();

        if ($plan->interval === PlanInterval::Free) {
            return back()->withErrors(['plan' => 'Plano gratuito não requer checkout.']);
        }

        $result = $this->mercadoPagoService->createPixPayment($user, $plan);

        if (empty($result['id']) || empty($result['point_of_interaction']['transaction_data']['qr_code'])) {
            return back()->withErrors(['plan' => 'Erro ao gerar o PIX. Tente novamente.']);
        }

        $pixPayment = PixPayment::query()->create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'mp_payment_id' => (string) $result['id'],
            'amount_in_cents' => $plan->price_in_cents,
            'status' => 'pending',
            'qr_code' => $result['point_of_interaction']['transaction_data']['qr_code'],
            'expires_at' => now()->addMinutes(30),
        ]);

        return redirect()->route('billing.payment', $pixPayment);
    }

    public function payment(Request $request, PixPayment $pixPayment): Response|RedirectResponse
    {
        if ($pixPayment->user_id !== $request->user()->id) {
            abort(403);
        }

        if ($pixPayment->status === 'paid') {
            return redirect()->route('billing.success');
        }

        return Inertia::render('billing/payment', [
            'pixPayment' => [
                'id' => $pixPayment->id,
                'qr_code' => $pixPayment->qr_code,
                'amount_in_cents' => $pixPayment->amount_in_cents,
                'expires_at' => $pixPayment->expires_at->toIso8601String(),
                'plan_name' => $pixPayment->plan->name,
            ],
        ]);
    }

    public function paymentStatus(Request $request, PixPayment $pixPayment): JsonResponse
    {
        if ($pixPayment->user_id !== $request->user()->id) {
            abort(403);
        }

        $status = $pixPayment->isExpired() ? 'expired' : $pixPayment->status;

        return response()->json(['status' => $status]);
    }

    public function stripeCheckout(Request $request, Plan $plan): RedirectResponse|\Symfony\Component\HttpFoundation\Response
    {
        $user = $request->user();

        if ($plan->interval === PlanInterval::Free) {
            return back()->withErrors(['plan' => 'Plano gratuito não requer checkout.']);
        }

        if (empty($plan->stripe_price_id)) {
            return back()->withErrors(['plan' => 'Este plano não está disponível para pagamento com cartão.']);
        }

        if ($user->subscribed('default')) {
            return $user->redirectToBillingPortal(route('billing.index'));
        }

        $subscription = $user->newSubscription('default', $plan->stripe_price_id);

        if ($plan->stripe_promo_price_id) {
            $subscription->withCoupon($plan->stripe_promo_price_id);
        }

        $checkout = $subscription->checkout([
            'success_url' => route('billing.success'),
            'cancel_url' => route('billing.index'),
        ])->toResponse($request);

        return Inertia::location($checkout->getTargetUrl());
    }

    public function portal(Request $request): RedirectResponse
    {
        return $request->user()->redirectToBillingPortal(route('billing.index'));
    }

    public function success(): Response
    {
        return Inertia::render('billing/success');
    }
}
