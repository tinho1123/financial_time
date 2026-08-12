<?php

namespace App\Http\Controllers;

use App\Enums\TransactionType;
use App\Http\Requests\Transactions\StoreTransactionRequest;
use App\Http\Requests\Transactions\UpdateTransactionRequest;
use App\Models\Account;
use App\Models\Transaction;
use App\Models\User;
use App\Services\BalanceService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TransactionController extends Controller
{
    public function __construct(private readonly BalanceService $balanceService) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $filters = $request->only(['type', 'category_id', 'account_id', 'from', 'to']);

        $transactions = $this->filteredQuery($user, $filters)
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

    public function export(Request $request): StreamedResponse
    {
        $user = $request->user();
        $filters = $request->only(['type', 'category_id', 'account_id', 'from', 'to']);

        $transactions = $this->filteredQuery($user, $filters)
            ->orderBy('date')
            ->orderBy('id')
            ->get();

        $filename = 'transacoes-'.now()->format('Y-m-d').'.csv';

        return response()->streamDownload(function () use ($transactions) {
            $handle = fopen('php://output', 'w');
            fwrite($handle, "\xEF\xBB\xBF");
            fputcsv($handle, ['Data', 'Tipo', 'Categoria', 'Conta', 'Descrição', 'Valor', 'Saldo após', 'Observações'], ';', '"', '\\');

            foreach ($transactions as $transaction) {
                fputcsv($handle, [
                    $transaction->date->format('d/m/Y'),
                    $transaction->type === TransactionType::Income ? 'Receita' : 'Despesa',
                    $transaction->category?->name ?? '',
                    $transaction->account?->name ?? '',
                    $transaction->description,
                    number_format($transaction->amount_in_cents / 100, 2, ',', ''),
                    number_format($transaction->current_balance_in_cents / 100, 2, ',', ''),
                    $transaction->notes ?? '',
                ], ';', '"', '\\');
            }

            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    private function filteredQuery(User $user, array $filters): Builder
    {
        return Transaction::query()
            ->where('user_id', $user->id)
            ->with(['account', 'category'])
            ->when($filters['type'] ?? null, fn ($q, $type) => $q->where('type', $type))
            ->when($filters['category_id'] ?? null, fn ($q, $id) => $q->where('category_id', $id))
            ->when($filters['account_id'] ?? null, fn ($q, $id) => $q->where('account_id', $id))
            ->when($filters['from'] ?? null, fn ($q, $from) => $q->where('date', '>=', $from))
            ->when($filters['to'] ?? null, fn ($q, $to) => $q->where('date', '<=', $to));
    }

    public function store(StoreTransactionRequest $request): RedirectResponse
    {
        $user = $request->user();
        $account = Account::query()->where('user_id', $user->id)->findOrFail($request->account_id);
        $balances = $this->balanceService->calculateForNewTransaction(
            $account,
            TransactionType::from($request->type),
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
