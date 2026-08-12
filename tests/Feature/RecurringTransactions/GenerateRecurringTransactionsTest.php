<?php

use App\Models\Account;
use App\Models\RecurringTransaction;
use App\Models\Transaction;
use App\Models\User;
use App\Services\RecurringTransactionService;
use Illuminate\Support\Carbon;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->account = Account::factory()->create([
        'user_id' => $this->user->id,
        'initial_balance_in_cents' => 0,
    ]);
    $this->service = app(RecurringTransactionService::class);
});

test('generates a transaction when next due date has arrived', function () {
    $recurring = RecurringTransaction::factory()->monthly()->create([
        'user_id' => $this->user->id,
        'account_id' => $this->account->id,
        'category_id' => null,
        'type' => 'income',
        'amount_in_cents' => 500000,
        'start_date' => '2026-04-01',
        'next_due_date' => '2026-04-01',
        'end_date' => null,
    ]);

    $generated = $this->service->generateDueTransactions(Carbon::parse('2026-04-01'));

    expect($generated)->toBe(1);

    $transaction = Transaction::where('recurring_transaction_id', $recurring->id)->first();
    expect($transaction)->not->toBeNull();
    expect($transaction->amount_in_cents)->toBe(500000);
    expect($transaction->date->format('Y-m-d'))->toBe('2026-04-01');
    expect($transaction->previous_balance_in_cents)->toBe(0);
    expect($transaction->current_balance_in_cents)->toBe(500000);

    expect($recurring->fresh()->next_due_date->format('Y-m-d'))->toBe('2026-05-01');
});

test('does not generate a transaction before the due date', function () {
    RecurringTransaction::factory()->monthly()->create([
        'user_id' => $this->user->id,
        'account_id' => $this->account->id,
        'start_date' => '2026-05-01',
        'next_due_date' => '2026-05-01',
        'end_date' => null,
    ]);

    $generated = $this->service->generateDueTransactions(Carbon::parse('2026-04-15'));

    expect($generated)->toBe(0);
    expect(Transaction::count())->toBe(0);
});

test('catches up on multiple missed weekly occurrences', function () {
    $recurring = RecurringTransaction::factory()->weekly()->create([
        'user_id' => $this->user->id,
        'account_id' => $this->account->id,
        'type' => 'expense',
        'amount_in_cents' => 1000,
        'start_date' => '2026-04-01',
        'next_due_date' => '2026-04-01',
        'end_date' => null,
    ]);

    // three weekly occurrences are due: 04-01, 04-08, 04-15
    $generated = $this->service->generateDueTransactions(Carbon::parse('2026-04-15'));

    expect($generated)->toBe(3);
    expect(Transaction::where('recurring_transaction_id', $recurring->id)->count())->toBe(3);
    expect($recurring->fresh()->next_due_date->format('Y-m-d'))->toBe('2026-04-22');

    $dates = Transaction::where('recurring_transaction_id', $recurring->id)
        ->orderBy('date')
        ->pluck('date')
        ->map(fn ($date) => $date->format('Y-m-d'))
        ->all();
    expect($dates)->toBe(['2026-04-01', '2026-04-08', '2026-04-15']);
});

test('keeps balances consistent across successive generated transactions', function () {
    RecurringTransaction::factory()->weekly()->create([
        'user_id' => $this->user->id,
        'account_id' => $this->account->id,
        'type' => 'income',
        'amount_in_cents' => 10000,
        'start_date' => '2026-04-01',
        'next_due_date' => '2026-04-01',
        'end_date' => null,
    ]);

    $this->service->generateDueTransactions(Carbon::parse('2026-04-15'));

    $transactions = Transaction::orderBy('date')->get();
    expect($transactions->pluck('previous_balance_in_cents')->all())->toBe([0, 10000, 20000]);
    expect($transactions->pluck('current_balance_in_cents')->all())->toBe([10000, 20000, 30000]);
});

test('does not generate for inactive recurring transactions', function () {
    RecurringTransaction::factory()->monthly()->inactive()->create([
        'user_id' => $this->user->id,
        'account_id' => $this->account->id,
        'start_date' => '2026-04-01',
        'next_due_date' => '2026-04-01',
    ]);

    $generated = $this->service->generateDueTransactions(Carbon::parse('2026-04-01'));

    expect($generated)->toBe(0);
    expect(Transaction::count())->toBe(0);
});

test('deactivates the recurring transaction once it passes the end date', function () {
    $recurring = RecurringTransaction::factory()->monthly()->create([
        'user_id' => $this->user->id,
        'account_id' => $this->account->id,
        'start_date' => '2026-04-01',
        'next_due_date' => '2026-04-01',
        'end_date' => '2026-04-01',
    ]);

    $generated = $this->service->generateDueTransactions(Carbon::parse('2026-06-01'));

    expect($generated)->toBe(1);
    expect($recurring->fresh()->is_active)->toBeFalse();
    expect(Transaction::where('recurring_transaction_id', $recurring->id)->count())->toBe(1);
});

test('monthly frequency does not drift away from its anchor day after passing through a short month', function () {
    $recurring = RecurringTransaction::factory()->monthly()->create([
        'user_id' => $this->user->id,
        'account_id' => $this->account->id,
        'start_date' => '2026-01-31',
        'next_due_date' => '2026-01-31',
        'end_date' => null,
    ]);

    // Feb 2026 has 28 days, so the first occurrence should land on Feb 28, not March 3.
    $this->service->generateDueTransactions(Carbon::parse('2026-01-31'));
    expect($recurring->fresh()->next_due_date->format('Y-m-d'))->toBe('2026-02-28');

    // Crucially, March has 31 days again: the schedule must jump back to the 31st
    // (computed from the original anchor) instead of staying stuck on the 28th
    // forever because it was chained from the truncated February occurrence.
    $this->service->generateDueTransactions(Carbon::parse('2026-02-28'));
    expect($recurring->fresh()->next_due_date->format('Y-m-d'))->toBe('2026-03-31');

    // April has 30 days.
    $this->service->generateDueTransactions(Carbon::parse('2026-03-31'));
    expect($recurring->fresh()->next_due_date->format('Y-m-d'))->toBe('2026-04-30');
});

test('yearly frequency does not drift away from a leap day anchor', function () {
    $recurring = RecurringTransaction::factory()->yearly()->create([
        'user_id' => $this->user->id,
        'account_id' => $this->account->id,
        'start_date' => '2028-02-29',
        'next_due_date' => '2028-02-29',
        'end_date' => null,
    ]);

    $expectedNextDueDates = [
        '2028-02-29' => '2029-02-28',
        '2029-02-28' => '2030-02-28',
        '2030-02-28' => '2031-02-28',
        // 2032 is a leap year again: the schedule must land back on Feb 29 (computed
        // from the original anchor), not drift to Mar 1 because it was chained from
        // the truncated intermediate occurrences.
        '2031-02-28' => '2032-02-29',
    ];

    foreach ($expectedNextDueDates as $asOf => $expectedNext) {
        $this->service->generateDueTransactions(Carbon::parse($asOf));
        expect($recurring->fresh()->next_due_date->format('Y-m-d'))->toBe($expectedNext);
    }
});

test('generating a backdated occurrence recalculates the balance of later existing transactions', function () {
    $laterTransaction = Transaction::factory()->income()->create([
        'user_id' => $this->user->id,
        'account_id' => $this->account->id,
        'amount_in_cents' => 5000,
        'previous_balance_in_cents' => 0,
        'current_balance_in_cents' => 5000,
        'date' => '2026-04-20',
    ]);

    RecurringTransaction::factory()->weekly()->create([
        'user_id' => $this->user->id,
        'account_id' => $this->account->id,
        'type' => 'income',
        'amount_in_cents' => 1000,
        'start_date' => '2026-04-01',
        'next_due_date' => '2026-04-01',
        'end_date' => '2026-04-01',
    ]);

    $this->service->generateDueTransactions(Carbon::parse('2026-04-01'));

    expect($laterTransaction->fresh()->previous_balance_in_cents)->toBe(6000);
    expect($laterTransaction->fresh()->current_balance_in_cents)->toBe(11000);
});

test('artisan command generates due transactions', function () {
    RecurringTransaction::factory()->weekly()->create([
        'user_id' => $this->user->id,
        'account_id' => $this->account->id,
        'start_date' => Carbon::today()->format('Y-m-d'),
        'next_due_date' => Carbon::today()->format('Y-m-d'),
        'end_date' => null,
    ]);

    $this->artisan('transactions:generate-recurring')
        ->expectsOutputToContain('Generated 1 transaction(s)')
        ->assertSuccessful();

    expect(Transaction::count())->toBe(1);
});

test('generates every installment and stops at the total, deactivating the plan', function () {
    $recurring = RecurringTransaction::factory()->installments(3)->create([
        'user_id' => $this->user->id,
        'account_id' => $this->account->id,
        'type' => 'expense',
        'amount_in_cents' => 10000,
        'start_date' => '2026-04-01',
        'next_due_date' => '2026-04-01',
        'end_date' => null,
    ]);

    // due: 04-01, 05-01, 06-01, and a hypothetical 07-01 that must NOT be generated.
    $generated = $this->service->generateDueTransactions(Carbon::parse('2026-08-01'));

    expect($generated)->toBe(3);
    expect($recurring->fresh()->is_active)->toBeFalse();
    expect($recurring->fresh()->installments_generated)->toBe(3);

    $transactions = Transaction::where('recurring_transaction_id', $recurring->id)
        ->orderBy('date')
        ->get();

    expect($transactions)->toHaveCount(3);
    expect($transactions->pluck('installment_number')->all())->toBe([1, 2, 3]);
    expect($transactions->pluck('installment_total')->all())->toBe([3, 3, 3]);
    expect($transactions->pluck('date')->map(fn ($date) => $date->format('Y-m-d'))->all())
        ->toBe(['2026-04-01', '2026-05-01', '2026-06-01']);
});

test('installment transactions are not generated for plain recurring transactions', function () {
    RecurringTransaction::factory()->monthly()->create([
        'user_id' => $this->user->id,
        'account_id' => $this->account->id,
        'start_date' => '2026-04-01',
        'next_due_date' => '2026-04-01',
        'end_date' => null,
    ]);

    $this->service->generateDueTransactions(Carbon::parse('2026-04-01'));

    $transaction = Transaction::first();
    expect($transaction->installment_number)->toBeNull();
    expect($transaction->installment_total)->toBeNull();
});
