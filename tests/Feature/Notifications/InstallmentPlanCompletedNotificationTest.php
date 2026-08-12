<?php

use App\Models\Account;
use App\Models\RecurringTransaction;
use App\Models\User;
use App\Notifications\InstallmentPlanCompletedNotification;
use App\Services\RecurringTransactionService;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Notification;

test('completing the last installment notifies the user', function () {
    Notification::fake();

    $user = User::factory()->create();
    $account = Account::factory()->create(['user_id' => $user->id]);
    RecurringTransaction::factory()->installments(2)->create([
        'user_id' => $user->id,
        'account_id' => $account->id,
        'next_due_date' => '2026-04-01',
        'end_date' => null,
    ]);

    app(RecurringTransactionService::class)->generateDueTransactions(Carbon::parse('2026-05-01'));

    Notification::assertSentTo($user, InstallmentPlanCompletedNotification::class);
});

test('generating a non-final installment does not notify completion', function () {
    Notification::fake();

    $user = User::factory()->create();
    $account = Account::factory()->create(['user_id' => $user->id]);
    RecurringTransaction::factory()->installments(3)->create([
        'user_id' => $user->id,
        'account_id' => $account->id,
        'next_due_date' => '2026-04-01',
        'end_date' => null,
    ]);

    app(RecurringTransactionService::class)->generateDueTransactions(Carbon::parse('2026-04-01'));

    Notification::assertNotSentTo($user, InstallmentPlanCompletedNotification::class);
});

test('a plain recurring transaction ending via end_date does not notify installment completion', function () {
    Notification::fake();

    $user = User::factory()->create();
    $account = Account::factory()->create(['user_id' => $user->id]);
    RecurringTransaction::factory()->monthly()->create([
        'user_id' => $user->id,
        'account_id' => $account->id,
        'next_due_date' => '2026-04-01',
        'end_date' => '2026-04-01',
    ]);

    app(RecurringTransactionService::class)->generateDueTransactions(Carbon::parse('2026-04-01'));

    Notification::assertNothingSent();
});
