<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PixPayment extends Model
{
    protected $fillable = [
        'user_id',
        'plan_id',
        'mp_payment_id',
        'amount_in_cents',
        'status',
        'qr_code',
        'expires_at',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'amount_in_cents' => 'integer',
            'expires_at' => 'datetime',
            'paid_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast() && $this->status === 'pending';
    }
}
