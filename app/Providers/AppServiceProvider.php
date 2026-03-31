<?php

namespace App\Providers;

use App\Listeners\CreemEventListener;
use Carbon\CarbonImmutable;
use Creem\Laravel\Events\CheckoutCompleted;
use Creem\Laravel\Events\SubscriptionActive;
use Creem\Laravel\Events\SubscriptionCanceled;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();

        Event::listen(CheckoutCompleted::class, [CreemEventListener::class, 'handleCheckoutCompleted']);
        Event::listen(SubscriptionActive::class, [CreemEventListener::class, 'handleSubscriptionActive']);
        Event::listen(SubscriptionCanceled::class, [CreemEventListener::class, 'handleSubscriptionCanceled']);
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
