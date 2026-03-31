<?php

namespace App\Models;

use App\Enums\PlanInterval;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
    /** @use HasFactory<\Database\Factories\PlanFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'price_in_cents',
        'promo_price_in_cents',
        'promo_months',
        'interval',
        'max_accounts',
        'max_categories',
        'has_advanced_charts',
        'creem_product_id',
        'has_creem_checkout',
    ];

    protected function casts(): array
    {
        return [
            'price_in_cents' => 'integer',
            'promo_price_in_cents' => 'integer',
            'promo_months' => 'integer',
            'interval' => PlanInterval::class,
            'max_accounts' => 'integer',
            'max_categories' => 'integer',
            'has_advanced_charts' => 'boolean',
            'has_creem_checkout' => 'boolean',
        ];
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function isLimitedAccounts(): bool
    {
        return ! is_null($this->max_accounts);
    }

    public function isLimitedCategories(): bool
    {
        return ! is_null($this->max_categories);
    }
}
