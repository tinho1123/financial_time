<?php

namespace App\Services;

use App\Models\Budget;
use App\Models\Transaction;
use Carbon\CarbonInterface;
use Illuminate\Support\Carbon;

class BudgetService
{
    /**
     * Sum of expense transactions posted to the budget's category within the given month.
     */
    public function spentInCents(Budget $budget, ?CarbonInterface $month = null): int
    {
        $month = $month ?? Carbon::today();

        return (int) Transaction::query()
            ->where('user_id', $budget->user_id)
            ->where('category_id', $budget->category_id)
            ->where('type', 'expense')
            ->whereBetween('date', [
                $month->copy()->startOfMonth()->format('Y-m-d'),
                $month->copy()->endOfMonth()->format('Y-m-d'),
            ])
            ->sum('amount_in_cents');
    }

    /**
     * Percentage of the budget already spent this month (uncapped, can exceed 100).
     */
    public function percentageSpent(Budget $budget, int $spentInCents): int
    {
        if ($budget->amount_in_cents === 0) {
            return 0;
        }

        return (int) round($spentInCents / $budget->amount_in_cents * 100);
    }
}
