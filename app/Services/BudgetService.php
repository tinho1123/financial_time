<?php

namespace App\Services;

use App\Enums\TransactionType;
use App\Models\Budget;
use App\Models\Transaction;
use App\Notifications\BudgetExceededNotification;
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

    /**
     * Notify the user the moment a newly created expense transaction pushes its
     * category's budget over 100% for the current month (fires once per crossing,
     * not on every subsequent transaction already over budget).
     */
    public function notifyIfJustExceeded(Transaction $transaction): void
    {
        if ($transaction->type !== TransactionType::Expense || $transaction->category_id === null) {
            return;
        }

        $today = Carbon::today();
        if (! $transaction->date->isSameMonth($today)) {
            return;
        }

        $budget = Budget::query()
            ->where('user_id', $transaction->user_id)
            ->where('category_id', $transaction->category_id)
            ->first();

        if (! $budget) {
            return;
        }

        $spentAfter = $this->spentInCents($budget, $today);
        $spentBefore = $spentAfter - $transaction->amount_in_cents;

        if ($spentBefore < $budget->amount_in_cents && $spentAfter >= $budget->amount_in_cents) {
            $transaction->user->notify(new BudgetExceededNotification($budget, $spentAfter));
        }
    }
}
