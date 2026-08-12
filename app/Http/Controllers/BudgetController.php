<?php

namespace App\Http\Controllers;

use App\Http\Requests\Budgets\StoreBudgetRequest;
use App\Http\Requests\Budgets\UpdateBudgetRequest;
use App\Models\Budget;
use App\Services\BudgetService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BudgetController extends Controller
{
    public function __construct(private readonly BudgetService $budgetService) {}

    public function index(Request $request): Response
    {
        $user = $request->user();

        $budgets = Budget::query()
            ->where('user_id', $user->id)
            ->with('category')
            ->get();

        $budgetsWithProgress = $budgets->map(function (Budget $budget) {
            $spent = $this->budgetService->spentInCents($budget);

            return [
                'id' => $budget->id,
                'category' => $budget->category,
                'amount_in_cents' => $budget->amount_in_cents,
                'spent_in_cents' => $spent,
                'percentage' => $this->budgetService->percentageSpent($budget, $spent),
            ];
        })->sortByDesc('percentage')->values();

        $availableCategories = $user->categories()
            ->where('type', 'expense')
            ->whereNotIn('id', $budgets->pluck('category_id'))
            ->orderBy('name')
            ->get();

        return Inertia::render('budgets/index', [
            'budgets' => $budgetsWithProgress,
            'availableCategories' => $availableCategories,
        ]);
    }

    public function store(StoreBudgetRequest $request): RedirectResponse
    {
        $request->user()->budgets()->create($request->validated());

        return back()->with('success', 'Orçamento criado com sucesso.');
    }

    public function update(UpdateBudgetRequest $request, Budget $budget): RedirectResponse
    {
        abort_if($budget->user_id !== $request->user()->id, 403);

        $budget->update($request->validated());

        return back()->with('success', 'Orçamento atualizado com sucesso.');
    }

    public function destroy(Request $request, Budget $budget): RedirectResponse
    {
        abort_if($budget->user_id !== $request->user()->id, 403);

        $budget->delete();

        return back()->with('success', 'Orçamento excluído.');
    }
}
