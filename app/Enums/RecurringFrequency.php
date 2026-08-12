<?php

namespace App\Enums;

use Carbon\CarbonInterface;

enum RecurringFrequency: string
{
    case Weekly = 'weekly';
    case Monthly = 'monthly';
    case Yearly = 'yearly';

    /**
     * Compute the Nth occurrence after the schedule's anchor date (its start_date).
     *
     * Always computed from the immutable anchor rather than chained from the previous
     * occurrence, so a monthly/yearly schedule anchored on a day that doesn't exist in
     * every month (e.g. the 31st, or Feb 29th) doesn't permanently drift to an earlier
     * day once it passes through a shorter month/non-leap year.
     */
    public function occurrenceAfterAnchor(CarbonInterface $anchor, int $occurrencesElapsed): CarbonInterface
    {
        return match ($this) {
            self::Weekly => $anchor->copy()->addWeeks($occurrencesElapsed),
            self::Monthly => $anchor->copy()->addMonthsNoOverflow($occurrencesElapsed),
            self::Yearly => $anchor->copy()->addYearsNoOverflow($occurrencesElapsed),
        };
    }
}
