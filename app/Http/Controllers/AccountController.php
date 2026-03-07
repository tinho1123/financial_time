<?php

namespace App\Http\Controllers;

use App\Http\Requests\Accounts\StoreAccountRequest;
use App\Http\Requests\Accounts\UpdateAccountRequest;
use App\Models\Account;
use App\Services\PlanLimitService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function __construct(private readonly PlanLimitService $planLimitService) {}

    public function index(Request $request): Response
    {
        $accounts = $request->user()->accounts()->orderBy('name')->get()->map(function (Account $account) {
            return array_merge($account->toArray(), [
                'current_balance_in_cents' => $account->currentBalanceInCents(),
            ]);
        });

        return Inertia::render('accounts/index', [
            'accounts' => $accounts,
            'canAddMore' => $request->user()->canAddAccount(),
        ]);
    }

    public function store(StoreAccountRequest $request): RedirectResponse
    {
        if (! $this->planLimitService->canCreateAccount($request->user())) {
            return back()->withErrors(['limit' => 'Você atingiu o limite de contas do plano gratuito.']);
        }

        $request->user()->accounts()->create($request->validated());

        return back()->with('success', 'Conta criada com sucesso.');
    }

    public function update(UpdateAccountRequest $request, Account $account): RedirectResponse
    {
        abort_if($account->user_id !== $request->user()->id, 403);

        $account->update($request->validated());

        return back()->with('success', 'Conta atualizada com sucesso.');
    }

    public function destroy(Request $request, Account $account): RedirectResponse
    {
        abort_if($account->user_id !== $request->user()->id, 403);

        $account->delete();

        return back()->with('success', 'Conta excluída.');
    }
}
