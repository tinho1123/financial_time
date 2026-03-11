<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Cashier\Billable;
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

    public function onPaidPlan(): bool
    {
        if ($this->subscribed('default')) {
            return true;
        }

        return $this->plan
            && $this->plan->has_advanced_charts
            && $this->plan_expires_at !== null
            && $this->plan_expires_at->isFuture();
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
