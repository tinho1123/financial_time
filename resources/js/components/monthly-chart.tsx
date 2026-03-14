import { formatCurrency } from '@/lib/currency';
import type { MonthlySummary } from '@/types';

interface MonthlyChartProps {
    data: MonthlySummary[];
}

export function MonthlyChart({ data }: MonthlyChartProps) {
    const maxValue = Math.max(
        ...data.flatMap((d) => [d.income_in_cents, d.expense_in_cents]),
        1,
    );

    const formatMonth = (month: string) => {
        const [year, m] = month.split('-');
        const date = new Date(Number(year), Number(m) - 1);
        return date
            .toLocaleDateString('pt-BR', { month: 'short' })
            .replace('.', '');
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-sm bg-green-500" />
                    Receitas
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-sm bg-red-500" />
                    Despesas
                </span>
            </div>
            <div className="flex h-40 items-end gap-2">
                {data.map((item) => (
                    <div
                        key={item.month}
                        className="group flex flex-1 flex-col items-center gap-1"
                    >
                        <div className="flex w-full flex-1 items-end gap-0.5">
                            <div
                                className="relative flex-1"
                                title={`Receitas: ${formatCurrency(item.income_in_cents)}`}
                            >
                                <div
                                    className="w-full rounded-t bg-green-500 transition-all"
                                    style={{
                                        height: `${(item.income_in_cents / maxValue) * 100}%`,
                                        minHeight:
                                            item.income_in_cents > 0
                                                ? '4px'
                                                : '0',
                                    }}
                                />
                            </div>
                            <div
                                className="relative flex-1"
                                title={`Despesas: ${formatCurrency(item.expense_in_cents)}`}
                            >
                                <div
                                    className="w-full rounded-t bg-red-500 transition-all"
                                    style={{
                                        height: `${(item.expense_in_cents / maxValue) * 100}%`,
                                        minHeight:
                                            item.expense_in_cents > 0
                                                ? '4px'
                                                : '0',
                                    }}
                                />
                            </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                            {formatMonth(item.month)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
