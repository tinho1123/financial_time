<?php

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
    $this->actingAs($this->user);
});

test('user can view categories page', function () {
    $this->get(route('categories.index'))->assertOk();
});

test('user can create a category', function () {
    $response = $this->post(route('categories.store'), [
        'name' => 'Alimentação',
        'type' => 'expense',
        'color' => '#ef4444',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('categories', [
        'user_id' => $this->user->id,
        'name' => 'Alimentação',
        'type' => 'expense',
        'color' => '#ef4444',
    ]);
});

test('category name must be unique per user and type', function () {
    Category::factory()->create([
        'user_id' => $this->user->id,
        'name' => 'Alimentação',
        'type' => 'expense',
    ]);

    $response = $this->post(route('categories.store'), [
        'name' => 'Alimentação',
        'type' => 'expense',
        'color' => '#ef4444',
    ]);

    $response->assertSessionHasErrors('name');
});

test('same name is allowed for different types', function () {
    Category::factory()->create([
        'user_id' => $this->user->id,
        'name' => 'Outros',
        'type' => 'expense',
    ]);

    $response = $this->post(route('categories.store'), [
        'name' => 'Outros',
        'type' => 'income',
        'color' => '#6366f1',
    ]);

    $response->assertRedirect();
    expect($this->user->categories()->where('name', 'Outros')->count())->toBe(2);
});

test('free plan is limited to 5 categories', function () {
    Category::factory()->count(5)->create(['user_id' => $this->user->id, 'type' => 'expense']);

    $response = $this->post(route('categories.store'), [
        'name' => 'Extra',
        'type' => 'expense',
        'color' => '#6366f1',
    ]);

    $response->assertSessionHasErrors('limit');
    expect($this->user->categories()->count())->toBe(5);
});

test('user can update their category', function () {
    $category = Category::factory()->create(['user_id' => $this->user->id]);

    $this->put(route('categories.update', $category), [
        'name' => 'Novo Nome',
        'type' => $category->type->value,
        'color' => '#22c55e',
    ])->assertRedirect();

    expect($category->fresh()->name)->toBe('Novo Nome');
});

test('user cannot update another user category', function () {
    $other = User::factory()->create();
    $category = Category::factory()->create(['user_id' => $other->id]);

    $this->put(route('categories.update', $category), [
        'name' => 'Hacked',
        'type' => 'expense',
        'color' => '#6366f1',
    ])->assertForbidden();
});

test('user can delete their category', function () {
    $category = Category::factory()->create(['user_id' => $this->user->id]);

    $this->delete(route('categories.destroy', $category))->assertRedirect();

    $this->assertDatabaseMissing('categories', ['id' => $category->id]);
});

test('user cannot delete another user category', function () {
    $other = User::factory()->create();
    $category = Category::factory()->create(['user_id' => $other->id]);

    $this->delete(route('categories.destroy', $category))->assertForbidden();
});
