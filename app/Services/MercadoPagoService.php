<?php

namespace App\Services;

use App\Models\Plan;
use App\Models\User;
use Illuminate\Support\Facades\Http;

class MercadoPagoService
{
    private string $accessToken;

    private string $baseUrl = 'https://api.mercadopago.com';

    public function __construct()
    {
        $this->accessToken = config('services.mercadopago.access_token', '');
    }

    /** @return array<string, mixed> */
    public function createPixPayment(User $user, Plan $plan): array
    {
        $amount = $plan->price_in_cents / 100;
        $nameParts = explode(' ', $user->name);

        $response = Http::withToken($this->accessToken)
            ->withHeaders(['X-Idempotency-Key' => uniqid('pix_', true)])
            ->post("{$this->baseUrl}/v1/payments", [
                'transaction_amount' => $amount,
                'description' => "Plano {$plan->name} - Financial Time",
                'payment_method_id' => 'pix',
                'date_of_expiration' => now()->addMinutes(30)->format('Y-m-d\TH:i:s.000P'),
                'notification_url' => config('services.mercadopago.webhook_url') ?: route('pix.webhook'),
                'payer' => [
                    'email' => $user->email,
                    'first_name' => $nameParts[0],
                    'last_name' => count($nameParts) > 1 ? implode(' ', array_slice($nameParts, 1)) : '',
                ],
            ]);

        return $response->json() ?? [];
    }

    /** @return array<string, mixed> */
    public function getPayment(string $mpPaymentId): array
    {
        $response = Http::withToken($this->accessToken)
            ->get("{$this->baseUrl}/v1/payments/{$mpPaymentId}");

        return $response->json() ?? [];
    }
}
