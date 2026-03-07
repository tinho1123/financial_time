import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/currency';
import type { TransactionType } from '@/types';

interface AmountDisplayProps {
    amountInCents: number;
    type?: TransactionType;
    showSign?: boolean;
    className?: string;
}

export function AmountDisplay({ amountInCents, type, showSign = false, className }: AmountDisplayProps) {
    const isIncome = type === 'income';
    const isExpense = type === 'expense';

    return (
        <span
            className={cn(
                'font-medium tabular-nums',
                isIncome && 'text-green-600 dark:text-green-400',
                isExpense && 'text-red-600 dark:text-red-400',
                className,
            )}
        >
            {showSign && isIncome && '+'}
            {showSign && isExpense && '-'}
            {formatCurrency(amountInCents)}
        </span>
    );
}
