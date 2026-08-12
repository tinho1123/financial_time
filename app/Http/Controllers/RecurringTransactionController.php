<?php

namespace App\Http\Controllers;

use App\Http\Requests\RecurringTransactions\StoreRecurringTransactionRequest;
use App\Http\Requests\RecurringTransactions\UpdateRecurringTransactionRequest;
use App\Models\RecurringTransaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RecurringTransactionController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $recurringTransactions = RecurringTransaction::query()
            ->where('user_id', $user->id)
            ->with(['account', 'category'])
            ->orderBy('next_due_date')
            ->get();

        $categories = $user->categories()->orderBy('name')->get();

        return Inertia::render('recurring-transactions/index', [
            'recurringTransactions' => $recurringTransactions,
            'incomeCategories' => $categories->where('type', 'income')->values(),
            'expenseCategories' => $categories->where('type', 'expense')->values(),
            'accounts' => $user->accounts()->orderBy('name')->get(),
        ]);
    }

    public function store(StoreRecurringTransactionRequest $request): RedirectResponse
    {
        RecurringTransaction::query()->create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
            'next_due_date' => $request->validated('start_date'),
            'is_active' => true,
        ]);

        return redirect()->route('recurring-transactions.index')->with('success', 'Transação recorrente criada com sucesso.');
    }

    public function update(UpdateRecurringTransactionRequest $request, RecurringTransaction $recurringTransaction): RedirectResponse
    {
        abort_if($recurringTransaction->user_id !== $request->user()->id, 403);

        $recurringTransaction->update($request->validated());

        return redirect()->route('recurring-transactions.index')->with('success', 'Transação recorrente atualizada com sucesso.');
    }

    public function destroy(Request $request, RecurringTransaction $recurringTransaction): RedirectResponse
    {
        abort_if($recurringTransaction->user_id !== $request->user()->id, 403);

        $recurringTransaction->delete();

        return redirect()->route('recurring-transactions.index')->with('success', 'Transação recorrente excluída.');
    }
}
