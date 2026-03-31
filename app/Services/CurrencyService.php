<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class CurrencyService
{
    private const CACHE_KEY = 'currency_rates_usd';

    private const CACHE_TTL = 3600; // 1 hour

    private const API_URL = 'https://open.er-api.com/v6/latest/USD';

    /** @var list<string> */
    private const SUPPORTED_CURRENCIES = [
        'USD', 'BRL', 'EUR', 'GBP', 'CAD', 'AUD',
        'MXN', 'ARS', 'CLP', 'COP', 'JPY', 'KRW',
        'INR', 'CHF', 'NOK', 'SEK', 'DKK', 'PLN',
        'CZK', 'HUF', 'RON', 'TRY',
    ];

    /**
     * Return exchange rates (USD as base). Cached for 1 hour.
     *
     * @return array<string, float>
     */
    public function getRates(): array
    {
        return Cache::remember(self::CACHE_KEY, self::CACHE_TTL, function (): array {
            try {
                $response = Http::timeout(10)->get(self::API_URL);

                if ($response->successful()) {
                    $all = $response->json('rates', []);

                    return array_intersect_key(
                        $all,
                        array_flip(self::SUPPORTED_CURRENCIES),
                    );
                }
            } catch (\Throwable) {
                // fall through to fallback
            }

            return ['USD' => 1.0];
        });
    }

    /**
     * Force a cache refresh.
     */
    public function clearCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }
}
