<?php

namespace App\Http\Controllers;

use App\Http\Requests\Goals\ContributeGoalRequest;
use App\Http\Requests\Goals\StoreGoalRequest;
use App\Http\Requests\Goals\UpdateGoalRequest;
use App\Models\Goal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GoalController extends Controller
{
    public function index(Request $request): Response
    {
        $goals = $request->user()->goals()->orderBy('created_at')->get();

        return Inertia::render('goals/index', [
            'goals' => $goals,
            'totalTargetInCents' => (int) $goals->sum('target_in_cents'),
            'totalSavedInCents' => (int) $goals->sum('saved_in_cents'),
        ]);
    }

    public function store(StoreGoalRequest $request): RedirectResponse
    {
        $request->user()->goals()->create([
            'saved_in_cents' => 0,
            ...$request->validated(),
        ]);

        return back()->with('success', 'Meta criada com sucesso.');
    }

    public function update(UpdateGoalRequest $request, Goal $goal): RedirectResponse
    {
        $goal->update($request->validated());

        return back()->with('success', 'Meta atualizada com sucesso.');
    }

    /**
     * Adds (or, with a negative amount, withdraws) money saved towards the goal.
     */
    public function contribute(ContributeGoalRequest $request, Goal $goal): RedirectResponse
    {
        $goal->update([
            'saved_in_cents' => max(0, $goal->saved_in_cents + $request->validated('amount_in_cents')),
        ]);

        return back()->with('success', 'Valor registrado na meta.');
    }

    public function destroy(Request $request, Goal $goal): RedirectResponse
    {
        abort_if($goal->user_id !== $request->user()->id, 403);

        $goal->delete();

        return back()->with('success', 'Meta excluída.');
    }
}
