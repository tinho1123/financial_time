<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();

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
            ->with(['account', 'category'])
            ->latest('date')
            ->latest('id')
            ->limit(5)
            ->get();

        $isPaidPlan = $user->onPaidPlan();

        $monthlySummary = [];
        $categoryBreakdown = [];

        if ($isPaidPlan) {
            $monthlySummary = $this->getMonthlySummary($user->id);
            $categoryBreakdown = $this->getCategoryBreakdown($user->id, $startOfMonth, $endOfMonth);
        }

        return Inertia::render('dashboard', [
            'totalIncomeInCents' => (int) $monthlyIncome,
            'totalExpenseInCents' => (int) $monthlyExpense,
            'netBalanceInCents' => (int) $netBalance,
            'recentTransactions' => $recentTransactions,
            'monthlySummary' => $monthlySummary,
            'categoryBreakdown' => $categoryBreakdown,
            'isPaidPlan' => $isPaidPlan,
        ]);
    }

    /** @return array<int, array{month: string, income_in_cents: int, expense_in_cents: int}> */
    private function getMonthlySummary(int $userId): array
    {
        $months = collect(range(5, 0))->map(fn ($i) => Carbon::now()->subMonths($i)->format('Y-m'));

        $results = Transaction::query()
            ->where('user_id', $userId)
            ->where('date', '>=', Carbon::now()->subMonths(5)->startOfMonth())
            ->selectRaw("to_char(date, 'YYYY-MM') as month, type, SUM(amount_in_cents) as total")
            ->groupByRaw("to_char(date, 'YYYY-MM'), type")
            ->get()
            ->groupBy('month');

        return $months->map(function ($month) use ($results) {
            $data = $results->get($month, collect());

            return [
                'month' => $month,
                'income_in_cents' => (int) ($data->firstWhere('type', 'income')?->total ?? 0),
                'expense_in_cents' => (int) ($data->firstWhere('type', 'expense')?->total ?? 0),
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
}
