<?php

namespace App\Http\Controllers;

use App\Enums\AccountType;
use App\Http\Requests\Investments\StoreInvestmentRequest;
use App\Http\Requests\Investments\UpdateInvestmentRequest;
use App\Models\Account;
use App\Services\PlanLimitService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InvestmentController extends Controller
{
    public function __construct(private readonly PlanLimitService $planLimitService) {}

    public function index(Request $request): Response
    {
        $investments = $request->user()->accounts()
            ->where('type', AccountType::Investment)
            ->orderBy('name')
            ->get()
            ->map(function (Account $account) {
                return array_merge($account->toArray(), [
                    'current_balance_in_cents' => $account->currentBalanceInCents(),
                ]);
            });

        return Inertia::render('investments/index', [
            'investments' => $investments,
            'totalInCents' => $investments->sum('current_balance_in_cents'),
            'canAddMore' => $request->user()->canAddAccount(),
        ]);
    }

    public function store(StoreInvestmentRequest $request): RedirectResponse
    {
        if (! $this->planLimitService->canCreateAccount($request->user())) {
            return back()->withErrors(['limit' => 'Você atingiu o limite de contas do plano gratuito.']);
        }

        $request->user()->accounts()->create([
            ...$request->validated(),
            'type' => AccountType::Investment,
        ]);

        return back()->with('success', 'Investimento criado com sucesso.');
    }

    public function update(UpdateInvestmentRequest $request, Account $investment): RedirectResponse
    {
        abort_if($investment->user_id !== $request->user()->id, 403);
        abort_if($investment->type !== AccountType::Investment, 404);

        $investment->update($request->validated());

        return back()->with('success', 'Investimento atualizado com sucesso.');
    }

    public function destroy(Request $request, Account $investment): RedirectResponse
    {
        abort_if($investment->user_id !== $request->user()->id, 403);
        abort_if($investment->type !== AccountType::Investment, 404);

        $investment->delete();

        return back()->with('success', 'Investimento excluído.');
    }
}
