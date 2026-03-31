import { useLocalizedPrice } from '@/hooks/use-localized-price';
import type { PlanInterval } from '@/types';

interface LocalizedPriceProps {
    /** USD price in cents (e.g. 500 = $5.00) */
    usdCents: number;
    interval: PlanInterval;
}

const INTERVAL_LABEL: Record<PlanInterval, string> = {
    free: '',
    monthly: '/mo',
    annual: '/yr',
};

export function LocalizedPrice({ usdCents, interval }: LocalizedPriceProps) {
    const { price, isLoading } = useLocalizedPrice(usdCents);

    if (isLoading) {
        return (
            <span className="inline-flex items-baseline gap-1">
                <span className="h-4 w-16 animate-pulse rounded bg-muted" />
                <span className="h-3 w-6 animate-pulse rounded bg-muted" />
            </span>
        );
    }

    if (!price) {
        return null;
    }

    return (
        <span className="inline-flex items-baseline gap-1">
            <span className="font-semibold">{price.formatted}</span>
            <span className="text-xs text-muted-foreground">
                {INTERVAL_LABEL[interval]}
            </span>
            {!price.isUsd && (
                <span className="text-xs text-muted-foreground">
                    (~{price.usdFormatted})
                </span>
            )}
        </span>
    );
}

export function LocalizedPriceDisclaimer() {
    return (
        <p className="text-center text-xs text-muted-foreground">
            * Cobrado em USD. O valor final pode variar de acordo com a taxa de câmbio e impostos aplicáveis.
        </p>
    );
}
