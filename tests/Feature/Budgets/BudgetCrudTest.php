<?php

use App\Models\Account;
use App\Models\Budget;
use App\Models\Category;
use App\Models\Plan;
use App\Models\User;

beforeEach(function () {
    $this->freePlan = Plan::factory()->create([
        'slug' => 'free',
        'interval' => 'free',
        'max_accounts' => 1,
        'max_categories' => 5,
        'has_advanced_charts' => false,
    ]);

    $this->user = User::factory()->create(['plan_id' => $this->freePlan->id]);
    $this->account = Account::factory()->create(['user_id' => $this->user->id]);
    $this->expenseCategory = Category::factory()->expense()->create(['user_id' => $this->user->id]);
    $this->incomeCategory = Category::factory()->income()->create(['user_id' => $this->user->id]);
    $this->actingAs($this->user);
});

test('user can view budgets page', function () {
    $this->get(route('budgets.index'))->assertOk();
});

test('user can create a budget for an expense category', function () {
    $this->post(route('budgets.store'), [
        'category_id' => $this->expenseCategory->id,
        'amount_in_cents' => '800.00',
    ])->assertRedirect();

    $budget = Budget::where('user_id', $this->user->id)->first();
    expect($budget)->not->toBeNull();
    expect($budget->category_id)->toBe($this->expenseCategory->id);
    expect($budget->amount_in_cents)->toBe(80000);
});

test('user cannot create a budget for an income category', function () {
    $this->post(route('budgets.store'), [
        'category_id' => $this->incomeCategory->id,
        'amount_in_cents' => '800.00',
    ])->assertSessionHasErrors('category_id');
});

test('user cannot create two budgets for the same category', function () {
    Budget::factory()->create([
        'user_id' => $this->user->id,
        'category_id' => $this->expenseCategory->id,
    ]);

    $this->post(route('budgets.store'), [
        'category_id' => $this->expenseCategory->id,
        'amount_in_cents' => '500.00',
    ])->assertSessionHasErrors('category_id');
});

test('user cannot create a budget for another user category', function () {
    $other = User::factory()->create();
    $otherCategory = Category::factory()->expense()->create(['user_id' => $other->id]);

    $this->post(route('budgets.store'), [
        'category_id' => $otherCategory->id,
        'amount_in_cents' => '500.00',
    ])->assertSessionHasErrors('category_id');
});

test('user can update a budget amount', function () {
    $budget = Budget::factory()->create([
        'user_id' => $this->user->id,
        'category_id' => $this->expenseCategory->id,
        'amount_in_cents' => 50000,
    ]);

    $this->put(route('budgets.update', $budget), [
        'amount_in_cents' => '999.90',
    ])->assertRedirect();

    expect($budget->fresh()->amount_in_cents)->toBe(99990);
});

test('user cannot update another user budget', function () {
    $other = User::factory()->create();
    $otherCategory = Category::factory()->expense()->create(['user_id' => $other->id]);
    $budget = Budget::factory()->create([
        'user_id' => $other->id,
        'category_id' => $otherCategory->id,
    ]);

    $this->put(route('budgets.update', $budget), [
        'amount_in_cents' => '100.00',
    ])->assertForbidden();
});

test('user can delete their budget', function () {
    $budget = Budget::factory()->create([
        'user_id' => $this->user->id,
        'category_id' => $this->expenseCategory->id,
    ]);

    $this->delete(route('budgets.destroy', $budget))->assertRedirect();

    $this->assertDatabaseMissing('budgets', ['id' => $budget->id]);
});

test('user cannot delete another user budget', function () {
    $other = User::factory()->create();
    $otherCategory = Category::factory()->expense()->create(['user_id' => $other->id]);
    $budget = Budget::factory()->create([
        'user_id' => $other->id,
        'category_id' => $otherCategory->id,
    ]);

    $this->delete(route('budgets.destroy', $budget))->assertForbidden();
});

test('budgeted category is excluded from available categories on the index page', function () {
    Budget::factory()->create([
        'user_id' => $this->user->id,
        'category_id' => $this->expenseCategory->id,
    ]);

    $response = $this->get(route('budgets.index'));

    $props = $response->original->getData()['page']['props'];
    expect(collect($props['availableCategories'])->pluck('id'))->not->toContain($this->expenseCategory->id);
});
