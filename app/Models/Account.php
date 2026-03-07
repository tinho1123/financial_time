<?php

namespace App\Models;

use App\Enums\AccountType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Account extends Model
{
    /** @use HasFactory<\Database\Factories\AccountFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'type',
        'initial_balance_in_cents',
    ];

    protected function casts(): array
    {
        return [
            'type' => AccountType::class,
            'initial_balance_in_cents' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function currentBalanceInCents(): int
    {
        $income = $this->transactions()->where('type', 'income')->sum('amount_in_cents');
        $expense = $this->transactions()->where('type', 'expense')->sum('amount_in_cents');

        return $this->initial_balance_in_cents + $income - $expense;
    }
}
