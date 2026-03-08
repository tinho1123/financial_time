<?php

namespace App\Http\Controllers;

use App\Enums\PlanInterval;
use App\Models\PixPayment;
use App\Services\MercadoPagoService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PixWebhookController extends Controller
{
    public function __construct(private readonly MercadoPagoService $mercadoPagoService) {}

    public function handle(Request $request): Response
    {
        $mpId = $request->input('data.id');

        if (! $mpId) {
            return response()->noContent();
        }

        $payment = $this->mercadoPagoService->getPayment((string) $mpId);

        if (($payment['status'] ?? '') !== 'approved') {
            return response()->noContent();
        }

        $pixPayment = PixPayment::query()
            ->with(['plan', 'user'])
            ->where('mp_payment_id', $mpId)
            ->first();

        if (! $pixPayment || $pixPayment->status === 'paid') {
            return response()->noContent();
        }

        $pixPayment->update(['status' => 'paid', 'paid_at' => now()]);

        $plan = $pixPayment->plan;
        $days = $plan->interval === PlanInterval::Annual ? 365 : 30;

        $pixPayment->user->update([
            'plan_id' => $plan->id,
            'plan_expires_at' => now()->addDays($days),
        ]);

        return response()->noContent();
    }
}
