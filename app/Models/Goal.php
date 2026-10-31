<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Goal extends Model
{
    /** @use HasFactory<\Database\Factories\GoalFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'target_in_cents',
        'saved_in_cents',
        'deadline',
    ];

    /** @var list<string> */
    protected $appends = [
        'percentage',
    ];

    protected function casts(): array
    {
        return [
            'target_in_cents' => 'integer',
            'saved_in_cents' => 'integer',
            'deadline' => 'date:Y-m-d',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    protected function percentage(): Attribute
    {
        return Attribute::get(function (): float {
            if ($this->target_in_cents <= 0) {
                return 0;
            }

            return round(min(100, ($this->saved_in_cents / $this->target_in_cents) * 100), 1);
        });
    }
}
