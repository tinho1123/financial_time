<?php

namespace App\Http\Controllers;

use App\Http\Requests\Categories\StoreCategoryRequest;
use App\Http\Requests\Categories\UpdateCategoryRequest;
use App\Models\Category;
use App\Services\PlanLimitService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function __construct(private readonly PlanLimitService $planLimitService) {}

    public function index(Request $request): Response
    {
        $categories = $request->user()->categories()->orderBy('name')->get()->groupBy('type');

        return Inertia::render('categories/index', [
            'incomeCategories' => $categories->get('income', collect())->values(),
            'expenseCategories' => $categories->get('expense', collect())->values(),
            'canAddMore' => $request->user()->canAddCategory(),
        ]);
    }

    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        if (! $this->planLimitService->canCreateCategory($request->user())) {
            return back()->withErrors(['limit' => 'Você atingiu o limite de categorias do plano gratuito.']);
        }

        $request->user()->categories()->create($request->validated());

        return back()->with('success', 'Categoria criada com sucesso.');
    }

    public function update(UpdateCategoryRequest $request, Category $category): RedirectResponse
    {
        abort_if($category->user_id !== $request->user()->id, 403);

        $category->update($request->validated());

        return back()->with('success', 'Categoria atualizada com sucesso.');
    }

    public function destroy(Request $request, Category $category): RedirectResponse
    {
        abort_if($category->user_id !== $request->user()->id, 403);

        $category->delete();

        return back()->with('success', 'Categoria excluída.');
    }
}
