<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Creem\Laravel\Traits\Billable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use Billable, HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'plan_id',
        'plan_expires_at',
        'creem_customer_id',
        'creem_subscription_id',
        'partner_name',
        'own_income_in_cents',
        'partner_income_in_cents',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'plan_expires_at' => 'datetime',
            'own_income_in_cents' => 'integer',
            'partner_income_in_cents' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (User $user): void {
            if (is_null($user->plan_id)) {
                $user->plan_id = Plan::query()
                    ->where('interval', 'free')
                    ->value('id');
            }
        });
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function categories(): HasMany
    {
        return $this->hasMany(Category::class);
    }

    public function accounts(): HasMany
    {
        return $this->hasMany(Account::class);
    }

    public function budgets(): HasMany
    {
        return $this->hasMany(Budget::class);
    }

    public function goals(): HasMany
    {
        return $this->hasMany(Goal::class);
    }

    public function hasCoupleSplit(): bool
    {
        return filled($this->partner_name)
            && $this->own_income_in_cents !== null
            && $this->partner_income_in_cents !== null
            && ($this->own_income_in_cents + $this->partner_income_in_cents) > 0;
    }

    public function hasActiveCreemSubscription(): bool
    {
        return ! is_null($this->creem_subscription_id);
    }

    public function onPaidPlan(): bool
    {
        if ($this->hasActiveCreemSubscription()) {
            return true;
        }

        if (! $this->plan || ! $this->plan->has_advanced_charts) {
            return false;
        }

        // No expiration date means the plan isn't a time-limited PIX purchase (e.g. it
        // was assigned directly), so the current plan is honored without a deadline.
        if ($this->plan_expires_at === null) {
            return true;
        }

        return $this->plan_expires_at->isFuture();
    }

    public function canAddAccount(): bool
    {
        if (! $this->plan || is_null($this->plan->max_accounts)) {
            return true;
        }

        return $this->accounts()->count() < $this->plan->max_accounts;
    }

    public function canAddCategory(): bool
    {
        if (! $this->plan || is_null($this->plan->max_categories)) {
            return true;
        }

        return $this->categories()->count() < $this->plan->max_categories;
    }
}
