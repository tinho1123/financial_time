<?php

namespace App\Http\Controllers;

use App\Http\Requests\DashboardRequest;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(DashboardRequest $request): Response
    {
        $user = $request->user();
        $startOfMonth = $request->selectedMonth();
        $endOfMonth = $startOfMonth->copy()->endOfMonth();

        $monthlyIncome = Transaction::query()
            ->where('user_id', $user->id)
            ->where('type', 'income')
            ->whereBetween('date', [$startOfMonth, $endOfMonth])
            ->sum('amount_in_cents');

        $monthlyExpense = Transaction::query()
            ->where('user_id', $user->id)
            ->where('type', 'expense')
            ->whereBetween('date', [$startOfMonth, $endOfMonth])
            ->sum('amount_in_cents');

        $netBalance = $user->accounts()->get()->sum(fn ($account) => $account->currentBalanceInCents());

        $recentTransactions = Transaction::query()
            ->where('user_id', $user->id)
            ->whereBetween('date', [$startOfMonth, $endOfMonth])
            ->with(['account', 'category'])
            ->latest('date')
            ->latest('id')
            ->limit(5)
            ->get();

        $isPaidPlan = $user->onPaidPlan();

        $monthlySummary = [];
        $categoryBreakdown = [];

        if ($isPaidPlan) {
            $monthlySummary = $this->getMonthlySummary($user->id, $startOfMonth);
            $categoryBreakdown = $this->getCategoryBreakdown($user->id, $startOfMonth, $endOfMonth);
        }

        return Inertia::render('dashboard', [
            'selectedMonth' => $startOfMonth->format('Y-m'),
            'currentMonth' => Carbon::now()->format('Y-m'),
            'totalIncomeInCents' => (int) $monthlyIncome,
            'totalExpenseInCents' => (int) $monthlyExpense,
            'netBalanceInCents' => (int) $netBalance,
            'recentTransactions' => $recentTransactions,
            'monthlySummary' => $monthlySummary,
            'categoryBreakdown' => $categoryBreakdown,
            'coupleSplit' => $this->getCoupleSplit($user, (int) $monthlyExpense),
            'goals' => $user->goals()->orderBy('created_at')->limit(3)->get(),
            'isPaidPlan' => $isPaidPlan,
        ]);
    }

    /**
     * Totals for the six months ending at the selected month. Grouping happens in PHP so the
     * query runs the same on SQLite (dev/tests) and MySQL (production).
     *
     * @return array<int, array{month: string, income_in_cents: int, expense_in_cents: int}>
     */
    private function getMonthlySummary(int $userId, Carbon $selectedMonth): array
    {
        $firstMonth = $selectedMonth->copy()->subMonths(5)->startOfMonth();
        $months = collect(range(5, 0))->map(fn ($i) => $selectedMonth->copy()->subMonths($i)->format('Y-m'));

        $totals = Transaction::query()
            ->where('user_id', $userId)
            ->whereBetween('date', [$firstMonth, $selectedMonth->copy()->endOfMonth()])
            ->get(['date', 'type', 'amount_in_cents'])
            ->groupBy(fn (Transaction $transaction) => $transaction->date->format('Y-m'));

        return $months->map(function (string $month) use ($totals) {
            $transactions = $totals->get($month, collect());

            return [
                'month' => $month,
                'income_in_cents' => (int) $transactions->where('type.value', 'income')->sum('amount_in_cents'),
                'expense_in_cents' => (int) $transactions->where('type.value', 'expense')->sum('amount_in_cents'),
            ];
        })->values()->toArray();
    }

    /** @return array<int, array{category_name: string, color: string, total_in_cents: int, percentage: float}> */
    private function getCategoryBreakdown(int $userId, Carbon $from, Carbon $to): array
    {
        $rows = Transaction::query()
            ->where('transactions.user_id', $userId)
            ->where('transactions.type', 'expense')
            ->whereBetween('transactions.date', [$from, $to])
            ->join('categories', 'categories.id', '=', 'transactions.category_id')
            ->selectRaw('categories.name as category_name, categories.color, SUM(transactions.amount_in_cents) as total')
            ->groupBy('categories.name', 'categories.color')
            ->orderByDesc('total')
            ->get();

        $grandTotal = $rows->sum('total');

        return $rows->map(fn ($row) => [
            'category_name' => $row->category_name,
            'color' => $row->color,
            'total_in_cents' => (int) $row->total,
            'percentage' => $grandTotal > 0 ? round(($row->total / $grandTotal) * 100, 1) : 0,
        ])->toArray();
    }

    /**
     * Splits the month's expenses between the user and their partner, proportionally to income.
     *
     * @return array{partner_name: string, own_income_in_cents: int, partner_income_in_cents: int, own_share_percentage: float, own_share_in_cents: int, partner_share_in_cents: int}|null
     */
    private function getCoupleSplit(User $user, int $expenseInCents): ?array
    {
        if (! $user->hasCoupleSplit()) {
            return null;
        }

        $ownIncome = (int) $user->own_income_in_cents;
        $partnerIncome = (int) $user->partner_income_in_cents;
        $ownShare = $ownIncome / ($ownIncome + $partnerIncome);
        $ownShareInCents = (int) round($expenseInCents * $ownShare);

        return [
            'partner_name' => $user->partner_name,
            'own_income_in_cents' => $ownIncome,
            'partner_income_in_cents' => $partnerIncome,
            'own_share_percentage' => round($ownShare * 100, 1),
            'own_share_in_cents' => $ownShareInCents,
            'partner_share_in_cents' => $expenseInCents - $ownShareInCents,
        ];
    }
}
