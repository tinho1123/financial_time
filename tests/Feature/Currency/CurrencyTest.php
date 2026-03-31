<?php

use App\Services\CurrencyService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    Cache::flush();
});

// ---------------------------------------------------------------------------
// CurrencyService
// ---------------------------------------------------------------------------

it('fetches and returns filtered rates from the API', function () {
    Http::fake([
        'open.er-api.com/*' => Http::response([
            'rates' => [
                'USD' => 1.0,
                'BRL' => 5.75,
                'EUR' => 0.92,
                'XYZ' => 999.0, // unsupported — should be filtered out
            ],
        ]),
    ]);

    $rates = app(CurrencyService::class)->getRates();

    expect($rates)
        ->toHaveKey('USD')
        ->toHaveKey('BRL')
        ->toHaveKey('EUR')
        ->not->toHaveKey('XYZ');
});

it('caches rates and only calls the API once', function () {
    Http::fake([
        'open.er-api.com/*' => Http::response(['rates' => ['USD' => 1.0, 'BRL' => 5.5]]),
    ]);

    $service = app(CurrencyService::class);

    $service->getRates();
    $service->getRates();

    Http::assertSentCount(1);
});

it('falls back to USD-only on a non-200 response', function () {
    Http::fake([
        'open.er-api.com/*' => Http::response([], 500),
    ]);

    $rates = app(CurrencyService::class)->getRates();

    expect($rates)->toBe(['USD' => 1.0]);
});

it('falls back to USD-only when the HTTP request throws an exception', function () {
    Http::fake([
        'open.er-api.com/*' => fn () => throw new \Exception('Connection refused'),
    ]);

    $rates = app(CurrencyService::class)->getRates();

    expect($rates)->toBe(['USD' => 1.0]);
});

it('does not include unsupported currencies in the response', function () {
    Http::fake([
        'open.er-api.com/*' => Http::response([
            'rates' => [
                'USD' => 1.0,
                'ABC' => 100.0,
                'ZZZ' => 200.0,
            ],
        ]),
    ]);

    $rates = app(CurrencyService::class)->getRates();

    expect($rates)->not->toHaveKey('ABC')->not->toHaveKey('ZZZ');
});

it('forces a re-fetch after clearCache', function () {
    Http::fake([
        'open.er-api.com/*' => Http::response(['rates' => ['USD' => 1.0, 'BRL' => 5.5]]),
    ]);

    $service = app(CurrencyService::class);

    $service->getRates();
    $service->clearCache();
    $service->getRates();

    Http::assertSentCount(2);
});

// ---------------------------------------------------------------------------
// CurrencyController — GET /currency/rates
// ---------------------------------------------------------------------------

it('returns rates with the correct JSON structure', function () {
    Http::fake([
        'open.er-api.com/*' => Http::response(['rates' => ['USD' => 1.0, 'BRL' => 5.75]]),
    ]);

    $this->getJson('/currency/rates')
        ->assertSuccessful()
        ->assertJsonStructure(['base', 'rates'])
        ->assertJsonPath('base', 'USD');
});

it('is accessible without authentication', function () {
    Http::fake([
        'open.er-api.com/*' => Http::response(['rates' => ['USD' => 1.0]]),
    ]);

    $this->getJson('/currency/rates')->assertSuccessful();
});

it('returns USD fallback when the external API is down', function () {
    Http::fake([
        'open.er-api.com/*' => Http::response([], 503),
    ]);

    $this->getJson('/currency/rates')
        ->assertSuccessful()
        ->assertJsonPath('rates.USD', 1);
});
