<?php

namespace App\Models;

use App\Enums\RecurringFrequency;
use App\Enums\TransactionType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RecurringTransaction extends Model
{
    /** @use HasFactory<\Database\Factories\RecurringTransactionFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'account_id',
        'category_id',
        'type',
        'amount_in_cents',
        'description',
        'notes',
        'frequency',
        'start_date',
        'end_date',
        'next_due_date',
        'is_active',
        'installments_total',
        'installments_generated',
    ];

    protected function casts(): array
    {
        return [
            'type' => TransactionType::class,
            'amount_in_cents' => 'integer',
            'frequency' => RecurringFrequency::class,
            'start_date' => 'date:Y-m-d',
            'end_date' => 'date:Y-m-d',
            'next_due_date' => 'date:Y-m-d',
            'is_active' => 'boolean',
            'installments_total' => 'integer',
            'installments_generated' => 'integer',
        ];
    }

    public function isInstallmentPurchase(): bool
    {
        return $this->installments_total !== null;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }
}
