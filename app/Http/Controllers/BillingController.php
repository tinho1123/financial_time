<?php

namespace App\Http\Controllers;

use App\Enums\PlanInterval;
use App\Models\PixPayment;
use App\Models\Plan;
use App\Services\MercadoPagoService;
use Creem\Laravel\Facades\Creem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class BillingController extends Controller
{
    public function __construct(private readonly MercadoPagoService $mercadoPagoService) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $plans = Plan::query()->orderBy('price_in_cents')->get();
        $creemPrices = $this->fetchCreemPrices($plans->pluck('creem_product_id')->filter()->values()->all());

        return Inertia::render('billing/index', [
            'plans' => $plans->map(fn (Plan $plan) => array_merge($plan->toArray(), [
                'has_creem_checkout' => ! empty($plan->creem_product_id),
                'usd_price_in_cents' => $creemPrices[$plan->creem_product_id] ?? null,
            ])),
            'currentPlan' => $user->plan,
            'planExpiresAt' => $user->plan_expires_at?->toDateString(),
            'isPaidPlan' => $user->onPaidPlan(),
            'isCreemSubscriber' => $user->hasActiveCreemSubscription(),
        ]);
    }

    /**
     * Fetch USD prices from Creem for the given product IDs.
     *
     * @param  string[]  $productIds
     * @return array<string, int|null>
     */
    private function fetchCreemPrices(array $productIds): array
    {
        $prices = [];

        foreach ($productIds as $productId) {
            try {
                $product = Creem::getProduct($productId);
                $prices[$productId] = isset($product['price']) ? (int) $product['price'] : null;
            } catch (\Throwable) {
                $prices[$productId] = null;
            }
        }

        return $prices;
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

    public function creemCheckout(Request $request, Plan $plan): SymfonyResponse
    {
        $user = $request->user();

        if ($plan->interval === PlanInterval::Free) {
            return back()->withErrors(['plan' => 'Plano gratuito não requer checkout.']);
        }

        if (empty($plan->creem_product_id)) {
            return back()->withErrors(['plan' => 'Este plano não está disponível para pagamento com cartão.']);
        }

        if ($user->hasActiveCreemSubscription()) {
            return redirect()->route('billing.portal');
        }

        $checkout = $user->checkout($plan->creem_product_id, [
            'success_url' => route('billing.success'),
            'cancel_url' => route('billing.index'),
        ]);

        return Inertia::location($checkout['checkout_url']);
    }

    public function portal(Request $request): RedirectResponse
    {
        $user = $request->user();

        if (! $user->hasCreemCustomerId()) {
            return redirect()->route('billing.index');
        }

        $portal = $user->billingPortalUrl();

        return redirect()->away($portal['customer_portal_link'] ?? $portal['url'] ?? route('billing.index'));
    }

    public function success(): Response
    {
        return Inertia::render('billing/success');
    }
}
