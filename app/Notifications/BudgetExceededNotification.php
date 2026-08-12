<?php

namespace App\Notifications;

use App\Models\Budget;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Carbon;

class BudgetExceededNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly Budget $budget,
        private readonly int $spentInCents,
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $category = $this->budget->category;
        $month = Carbon::today()->translatedFormat('F/Y');
        $spent = number_format($this->spentInCents / 100, 2, ',', '.');
        $limit = number_format($this->budget->amount_in_cents / 100, 2, ',', '.');

        return [
            'title' => 'Orçamento estourado',
            'message' => "Você ultrapassou o orçamento de \"{$category->name}\" em {$month}: R$ {$spent} de R$ {$limit}.",
            'url' => route('budgets.index'),
        ];
    }
}
