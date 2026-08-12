<?php

namespace App\Services;

use App\Models\RecurringTransaction;
use App\Models\Transaction;
use App\Notifications\InstallmentPlanCompletedNotification;
use Carbon\CarbonInterface;
use Illuminate\Support\Carbon;

class RecurringTransactionService
{
    public function __construct(
        private readonly BalanceService $balanceService,
        private readonly BudgetService $budgetService,
    ) {}

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
            if ($this->hasReachedEndDate($recurringTransaction) || $this->hasReachedInstallmentLimit($recurringTransaction)) {
                $recurringTransaction->update(['is_active' => false]);
                break;
            }

            $transaction = $this->createTransactionFor($recurringTransaction);
            $generated++;
            $this->budgetService->notifyIfJustExceeded($transaction);

            $installmentsGenerated = $recurringTransaction->installments_generated + 1;
            $nextDueDate = $recurringTransaction->frequency->occurrenceAfterAnchor(
                $recurringTransaction->start_date,
                $installmentsGenerated,
            );

            $recurringTransaction->update([
                'next_due_date' => $nextDueDate->format('Y-m-d'),
                'installments_generated' => $installmentsGenerated,
            ]);

            if ($this->hasReachedInstallmentLimit($recurringTransaction)) {
                $recurringTransaction->update(['is_active' => false]);
                $recurringTransaction->user->notify(new InstallmentPlanCompletedNotification($recurringTransaction));
            } elseif ($this->hasReachedEndDate($recurringTransaction)) {
                $recurringTransaction->update(['is_active' => false]);
            }
        }

        return $generated;
    }

    private function hasReachedEndDate(RecurringTransaction $recurringTransaction): bool
    {
        return $recurringTransaction->end_date !== null
            && $recurringTransaction->next_due_date->gt($recurringTransaction->end_date);
    }

    private function hasReachedInstallmentLimit(RecurringTransaction $recurringTransaction): bool
    {
        return $recurringTransaction->isInstallmentPurchase()
            && $recurringTransaction->installments_generated >= $recurringTransaction->installments_total;
    }

    private function createTransactionFor(RecurringTransaction $recurringTransaction): Transaction
    {
        $balances = $this->balanceService->calculateForNewTransaction(
            $recurringTransaction->account,
            $recurringTransaction->type,
            $recurringTransaction->amount_in_cents,
        );

        $transaction = Transaction::query()->create([
            'user_id' => $recurringTransaction->user_id,
            'account_id' => $recurringTransaction->account_id,
            'category_id' => $recurringTransaction->category_id,
            'recurring_transaction_id' => $recurringTransaction->id,
            'installment_number' => $recurringTransaction->isInstallmentPurchase()
                ? $recurringTransaction->installments_generated + 1
                : null,
            'installment_total' => $recurringTransaction->installments_total,
            'type' => $recurringTransaction->type,
            'amount_in_cents' => $recurringTransaction->amount_in_cents,
            'previous_balance_in_cents' => $balances['previous'],
            'current_balance_in_cents' => $balances['current'],
            'description' => $recurringTransaction->description,
            'date' => $recurringTransaction->next_due_date->format('Y-m-d'),
            'notes' => $recurringTransaction->notes,
        ]);

        // A catch-up run can insert several backdated transactions in one pass; if any
        // land before an already-existing later transaction on the same account, that
        // transaction's balance snapshot needs to be recalculated to stay accurate.
        $this->balanceService->recalculateFromTransaction($transaction);

        return $transaction;
    }
}
