<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TransactionController;
use App\Models\Plan;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Cashier\Http\Controllers\WebhookController;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
        'plans' => Plan::query()->orderBy('price_in_cents')->get(),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::resource('transactions', TransactionController::class)->except(['show', 'create', 'edit']);
    Route::resource('categories', CategoryController::class)->except(['show', 'create', 'edit']);
    Route::resource('accounts', AccountController::class)->except(['show', 'create', 'edit']);

    Route::prefix('billing')->name('billing.')->group(function () {
        Route::get('/', [BillingController::class, 'index'])->name('index');
        Route::post('checkout/{plan}', [BillingController::class, 'checkout'])->name('checkout');
        Route::get('success', [BillingController::class, 'success'])->name('success');
        Route::get('portal', [BillingController::class, 'portal'])->name('portal');
    });
});

Route::post('stripe/webhook', [WebhookController::class, 'handleWebhook'])->name('cashier.webhook');

require __DIR__.'/settings.php';
