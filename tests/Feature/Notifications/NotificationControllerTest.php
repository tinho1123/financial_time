<?php

use App\Models\Budget;
use App\Models\Category;
use App\Models\User;
use App\Notifications\BudgetExceededNotification;

beforeEach(function () {
    $this->user = User::factory()->create();
    $category = Category::factory()->expense()->create(['user_id' => $this->user->id]);
    $this->budget = Budget::factory()->create([
        'user_id' => $this->user->id,
        'category_id' => $category->id,
    ]);

    $this->user->notify(new BudgetExceededNotification($this->budget, 20000));
    $this->notification = $this->user->notifications()->first();
});

test('user can mark their own notification as read', function () {
    $this->actingAs($this->user);

    $this->post(route('notifications.read', $this->notification))->assertRedirect();

    expect($this->notification->fresh()->read_at)->not->toBeNull();
});

test('user cannot mark another user notification as read', function () {
    $other = User::factory()->create();
    $this->actingAs($other);

    $this->post(route('notifications.read', $this->notification))->assertForbidden();

    expect($this->notification->fresh()->read_at)->toBeNull();
});

test('mark all as read clears every unread notification', function () {
    $this->actingAs($this->user);
    $this->user->notify(new BudgetExceededNotification($this->budget, 20000));

    expect($this->user->unreadNotifications()->count())->toBe(2);

    $this->post(route('notifications.read-all'))->assertRedirect();

    expect($this->user->unreadNotifications()->count())->toBe(0);
});
