<?php

namespace App\Services;

use App\Enums\TransactionType;
use App\Models\Account;
use App\Models\Transaction;

class BalanceService
{
    /**
     * @return array{previous: int, current: int}
     */
    public function calculateForNewTransaction(Account $account, TransactionType $type, int $amountInCents): array
    {
        $previous = $account->currentBalanceInCents();
        $current = $type === TransactionType::Income
            ? $previous + $amountInCents
            : $previous - $amountInCents;

        return ['previous' => $previous, 'current' => $current];
    }

    public function recalculateFromTransaction(Transaction $transaction): void
    {
        $subsequentTransactions = Transaction::query()
            ->where('account_id', $transaction->account_id)
            ->where(function ($query) use ($transaction) {
                $query->where('date', '>', $transaction->date)
                    ->orWhere(function ($q) use ($transaction) {
                        $q->where('date', $transaction->date)
                            ->where('id', '>', $transaction->id);
                    });
            })
            ->orderBy('date')
            ->orderBy('id')
            ->get();

        $runningBalance = $transaction->current_balance_in_cents;

        foreach ($subsequentTransactions as $subsequent) {
            $previous = $runningBalance;
            $runningBalance = $subsequent->type === TransactionType::Income
                ? $previous + $subsequent->amount_in_cents
                : $previous - $subsequent->amount_in_cents;

            $subsequent->update([
                'previous_balance_in_cents' => $previous,
                'current_balance_in_cents' => $runningBalance,
            ]);
        }
    }
}
