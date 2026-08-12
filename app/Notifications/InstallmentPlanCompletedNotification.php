<?php

namespace App\Notifications;

use App\Models\RecurringTransaction;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class InstallmentPlanCompletedNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly RecurringTransaction $recurringTransaction,
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
        $description = $this->recurringTransaction->description;
        $total = $this->recurringTransaction->installments_total;

        return [
            'title' => 'Parcelamento concluído',
            'message' => "Todas as {$total} parcelas de \"{$description}\" foram lançadas.",
            'url' => route('recurring-transactions.index'),
        ];
    }
}
