import { useEffect, useState } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Rates = Record<string, number>;

export type LocalizedPrice = {
    /** Price formatted in the user's local currency, e.g. "R$29" or "€4.62" */
    formatted: string;
    /** ISO 4217 currency code, e.g. "BRL" */
    currency: string;
    /** True when the detected currency equals USD (no conversion needed) */
    isUsd: boolean;
    /** Always-USD formatted string for the disclaimer hint, e.g. "$5.00" */
    usdFormatted: string;
};

// ---------------------------------------------------------------------------
// Locale → currency mapping
// ---------------------------------------------------------------------------

const LOCALE_CURRENCY: Record<string, string> = {
    // Portuguese
    'pt-BR': 'BRL',
    'pt-PT': 'EUR',
    pt: 'BRL',
    // English
    'en-US': 'USD',
    'en-CA': 'CAD',
    'en-GB': 'GBP',
    'en-AU': 'AUD',
    'en-NZ': 'NZD',
    en: 'USD',
    // Spanish
    'es-MX': 'MXN',
    'es-AR': 'ARS',
    'es-CL': 'CLP',
    'es-CO': 'COP',
    es: 'EUR',
    // European
    de: 'EUR',
    fr: 'EUR',
    it: 'EUR',
    nl: 'EUR',
    pl: 'PLN',
    cs: 'CZK',
    hu: 'HUF',
    ro: 'RON',
    sv: 'SEK',
    no: 'NOK',
    da: 'DKK',
    tr: 'TRY',
    // Asian
    ja: 'JPY',
    ko: 'KRW',
    hi: 'INR',
    // Swiss
    'de-CH': 'CHF',
    'fr-CH': 'CHF',
};

/**
 * Currencies that display no decimal places (whole units only).
 * Prices in these currencies are rounded up to the nearest whole unit.
 */
const WHOLE_UNIT_CURRENCIES = new Set([
    'BRL', 'MXN', 'ARS', 'CLP', 'COP', 'JPY', 'KRW',
]);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function detectCurrency(): string {
    if (typeof navigator === 'undefined') {
        return 'USD';
    }

    const locale = navigator.language ?? 'en-US';

    // Try exact locale match first (e.g. "pt-BR"), then language code (e.g. "pt")
    return LOCALE_CURRENCY[locale]
        ?? LOCALE_CURRENCY[locale.split('-')[0]]
        ?? 'USD';
}

/**
 * Round up a monetary amount based on currency conventions:
 * - Whole-unit currencies (BRL, JPY…): ceil to nearest integer
 * - Others: ceil to nearest cent (2 decimal places)
 */
function roundUp(amount: number, currency: string): number {
    if (WHOLE_UNIT_CURRENCIES.has(currency)) {
        return Math.ceil(amount);
    }

    return Math.ceil(amount * 100) / 100;
}

function formatLocal(amount: number, currency: string): string {
    const fractionDigits = WHOLE_UNIT_CURRENCIES.has(currency) ? 0 : 2;

    return new Intl.NumberFormat(
        typeof navigator !== 'undefined' ? navigator.language : 'en-US',
        {
            style: 'currency',
            currency,
            minimumFractionDigits: fractionDigits,
            maximumFractionDigits: fractionDigits,
        },
    ).format(amount);
}

// ---------------------------------------------------------------------------
// Module-level client cache (avoids re-fetching during the same session)
// ---------------------------------------------------------------------------

let clientCache: { rates: Rates; fetchedAt: number } | null = null;

async function fetchRates(): Promise<Rates> {
    const ONE_HOUR = 3_600_000;

    if (clientCache && Date.now() - clientCache.fetchedAt < ONE_HOUR) {
        return clientCache.rates;
    }

    const res = await fetch('/currency/rates');

    if (!res.ok) {
        throw new Error(`Currency API error: ${res.status}`);
    }

    const data = (await res.json()) as { rates: Rates };
    clientCache = { rates: data.rates, fetchedAt: Date.now() };

    return data.rates;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Convert a USD price (in cents) to the user's local currency.
 *
 * @param usdCents  Price in USD cents (e.g. 500 = $5.00). Pass null for free plans.
 */
export function useLocalizedPrice(usdCents: number | null): {
    price: LocalizedPrice | null;
    isLoading: boolean;
} {
    const [price, setPrice] = useState<LocalizedPrice | null>(null);

    useEffect(() => {
        if (usdCents === null || usdCents === 0) {
            return;
        }

        const usdAmount = usdCents / 100;

        const usdFormatted = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(usdAmount);

        fetchRates()
            .then((rates) => {
                const currency = detectCurrency();
                const rate = rates[currency] ?? 1;
                const localAmount = roundUp(usdAmount * rate, currency);

                setPrice({
                    formatted: formatLocal(localAmount, currency),
                    currency,
                    isUsd: currency === 'USD',
                    usdFormatted,
                });
            })
            .catch(() => {
                // Fallback: show USD price on API failure
                setPrice({
                    formatted: usdFormatted,
                    currency: 'USD',
                    isUsd: true,
                    usdFormatted,
                });
            });
    }, [usdCents]);

    const isLoading = (usdCents !== null && usdCents !== 0) && price === null;

    return { price, isLoading };
}
