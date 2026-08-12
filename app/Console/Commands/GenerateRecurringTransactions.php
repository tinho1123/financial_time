<?php

namespace App\Console\Commands;

use App\Services\RecurringTransactionService;
use Illuminate\Console\Command;

class GenerateRecurringTransactions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'transactions:generate-recurring';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate transactions due from active recurring transaction schedules';

    /**
     * Execute the console command.
     */
    public function handle(RecurringTransactionService $recurringTransactionService): int
    {
        $generated = $recurringTransactionService->generateDueTransactions();

        $this->info("Generated {$generated} transaction(s) from recurring schedules.");

        return self::SUCCESS;
    }
}
