<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\CoupleSplitUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CoupleSplitController extends Controller
{
    /**
     * Show the couple split settings page.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('settings/couple-split', [
            'partnerName' => $user->partner_name,
            'ownIncomeInCents' => $user->own_income_in_cents,
            'partnerIncomeInCents' => $user->partner_income_in_cents,
        ]);
    }

    /**
     * Save the partner and both monthly incomes used to split shared expenses.
     */
    public function update(CoupleSplitUpdateRequest $request): RedirectResponse
    {
        $request->user()->update($request->validated());

        return to_route('couple-split.edit');
    }
}
