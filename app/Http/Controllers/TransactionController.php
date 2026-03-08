<?php

namespace App\Http\Controllers;

use App\Http\Requests\Transactions\StoreTransactionRequest;
use App\Http\Requests\Transactions\UpdateTransactionRequest;
use App\Models\Account;
use App\Models\Transaction;
use App\Services\BalanceService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function __construct(private readonly BalanceService $balanceService) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $filters = $request->only(['type', 'category_id', 'account_id', 'from', 'to']);

        $transactions = Transaction::query()
            ->where('user_id', $user->id)
            ->with(['account', 'category'])
            ->when($filters['type'] ?? null, fn ($q, $type) => $q->where('type', $type))
            ->when($filters['category_id'] ?? null, fn ($q, $id) => $q->where('category_id', $id))
            ->when($filters['account_id'] ?? null, fn ($q, $id) => $q->where('account_id', $id))
            ->when($filters['from'] ?? null, fn ($q, $from) => $q->where('date', '>=', $from))
            ->when($filters['to'] ?? null, fn ($q, $to) => $q->where('date', '<=', $to))
            ->latest('date')
            ->latest('id')
            ->paginate(20)
            ->withQueryString();

        $categories = $user->categories()->orderBy('name')->get();

        return Inertia::render('transactions/index', [
            'transactions' => $transactions,
            'filters' => $filters,
            'incomeCategories' => $categories->where('type', 'income')->values(),
            'expenseCategories' => $categories->where('type', 'expense')->values(),
            'accounts' => $user->accounts()->orderBy('name')->get(),
        ]);
    }

    public function store(StoreTransactionRequest $request): RedirectResponse
    {
        $user = $request->user();
        $account = Account::query()->where('user_id', $user->id)->findOrFail($request->account_id);
        $balances = $this->balanceService->calculateForNewTransaction(
            $account,
            \App\Enums\TransactionType::from($request->type),
            $request->amount_in_cents
        );

        Transaction::query()->create([
            ...$request->validated(),
            'user_id' => $user->id,
            'previous_balance_in_cents' => $balances['previous'],
            'current_balance_in_cents' => $balances['current'],
        ]);

        return redirect()->route('transactions.index')->with('success', 'Transação criada com sucesso.');
    }

    public function update(UpdateTransactionRequest $request, Transaction $transaction): RedirectResponse
    {
        abort_if($transaction->user_id !== $request->user()->id, 403);

        $transaction->update($request->validated());
        $this->balanceService->recalculateFromTransaction($transaction);

        return redirect()->route('transactions.index')->with('success', 'Transação atualizada com sucesso.');
    }

    public function destroy(Request $request, Transaction $transaction): RedirectResponse
    {
        abort_if($transaction->user_id !== $request->user()->id, 403);

        $transaction->delete();

        return redirect()->route('transactions.index')->with('success', 'Transação excluída.');
    }
}
