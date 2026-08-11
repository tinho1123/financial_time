<?php

namespace App\Services;

use App\Models\RecurringTransaction;
use App\Models\Transaction;
use Carbon\CarbonInterface;
use Illuminate\Support\Carbon;

class RecurringTransactionService
{
    public function __construct(private readonly BalanceService $balanceService) {}

    /**
     * Generate every transaction due (including missed occurrences) for all active
     * recurring transactions, advancing each schedule past $asOf (defaults to today).
     */
    public function generateDueTransactions(?CarbonInterface $asOf = null): int
    {
        $today = ($asOf ?? Carbon::today())->copy()->startOfDay();

        $dueRecurringTransactions = RecurringTransaction::query()
            ->where('is_active', true)
            ->where('next_due_date', '<=', $today->format('Y-m-d'))
            ->with('account')
            ->get();

        $generated = 0;

        foreach ($dueRecurringTransactions as $recurringTransaction) {
            $generated += $this->processRecurringTransaction($recurringTransaction, $today);
        }

        return $generated;
    }

    private function processRecurringTransaction(RecurringTransaction $recurringTransaction, CarbonInterface $today): int
    {
        $generated = 0;

        while ($recurringTransaction->is_active && $recurringTransaction->next_due_date->lte($today)) {
            if ($recurringTransaction->end_date && $recurringTransaction->next_due_date->gt($recurringTransaction->end_date)) {
                $recurringTransaction->update(['is_active' => false]);
                break;
            }

            $this->createTransactionFor($recurringTransaction);
            $generated++;

            $nextDueDate = $recurringTransaction->frequency->nextOccurrence($recurringTransaction->next_due_date);
            $isPastEndDate = $recurringTransaction->end_date && $nextDueDate->gt($recurringTransaction->end_date);

            $recurringTransaction->update([
                'next_due_date' => $nextDueDate,
                'is_active' => ! $isPastEndDate,
            ]);
        }

        return $generated;
    }

    private function createTransactionFor(RecurringTransaction $recurringTransaction): Transaction
    {
        $balances = $this->balanceService->calculateForNewTransaction(
            $recurringTransaction->account,
            $recurringTransaction->type,
            $recurringTransaction->amount_in_cents,
        );

        return Transaction::query()->create([
            'user_id' => $recurringTransaction->user_id,
            'account_id' => $recurringTransaction->account_id,
            'category_id' => $recurringTransaction->category_id,
            'recurring_transaction_id' => $recurringTransaction->id,
            'type' => $recurringTransaction->type,
            'amount_in_cents' => $recurringTransaction->amount_in_cents,
            'previous_balance_in_cents' => $balances['previous'],
            'current_balance_in_cents' => $balances['current'],
            'description' => $recurringTransaction->description,
            'date' => $recurringTransaction->next_due_date->format('Y-m-d'),
            'notes' => $recurringTransaction->notes,
        ]);
    }
}
