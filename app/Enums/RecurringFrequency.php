<?php

namespace App\Enums;

use Carbon\CarbonInterface;

enum RecurringFrequency: string
{
    case Weekly = 'weekly';
    case Monthly = 'monthly';
    case Yearly = 'yearly';

    public function nextOccurrence(CarbonInterface $from): CarbonInterface
    {
        return match ($this) {
            self::Weekly => $from->copy()->addWeek(),
            self::Monthly => $from->copy()->addMonthNoOverflow(),
            self::Yearly => $from->copy()->addYear(),
        };
    }
}
