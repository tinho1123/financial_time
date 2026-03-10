<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PixWebhookController;
use App\Http\Controllers\TransactionController;
use App\Models\Plan;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Cashier\Http\Controllers\WebhookController as CashierWebhookController;
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
        Route::post('stripe/{plan}', [BillingController::class, 'stripeCheckout'])->name('stripe');
        Route::get('portal', [BillingController::class, 'portal'])->name('portal');
        Route::get('payment/{pixPayment}', [BillingController::class, 'payment'])->name('payment');
        Route::get('payment-status/{pixPayment}', [BillingController::class, 'paymentStatus'])->name('payment-status');
        Route::get('success', [BillingController::class, 'success'])->name('success');
    });
});

Route::post('/pix/webhook', [PixWebhookController::class, 'handle'])->name('pix.webhook');
Route::post('/stripe/webhook', [CashierWebhookController::class, 'handleWebhook'])->name('cashier.webhook');

require __DIR__.'/settings.php';
