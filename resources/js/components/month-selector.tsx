import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MonthSelectorProps {
    month: string;
    currentMonth: string;
    onChange: (month: string) => void;
}

function shiftMonth(month: string, delta: number): string {
    const [year, monthNumber] = month.split('-').map(Number);
    const date = new Date(year, monthNumber - 1 + delta, 1);

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function formatMonthLabel(month: string): string {
    const [year, monthNumber] = month.split('-').map(Number);

    const label = new Date(year, monthNumber - 1, 1).toLocaleDateString(
        'pt-BR',
        { month: 'long', year: 'numeric' },
    );

    return label.charAt(0).toUpperCase() + label.slice(1);
}

export function MonthSelector({
    month,
    currentMonth,
    onChange,
}: MonthSelectorProps) {
    return (
        <div className="flex items-center gap-1">
            <Button
                size="icon"
                variant="ghost"
                className="size-7"
                onClick={() => onChange(shiftMonth(month, -1))}
                aria-label="Mês anterior"
            >
                <ChevronLeft className="size-4" />
            </Button>
            <span className="min-w-32 text-center text-sm text-muted-foreground">
                {formatMonthLabel(month)}
            </span>
            <Button
                size="icon"
                variant="ghost"
                className="size-7"
                onClick={() => onChange(shiftMonth(month, 1))}
                aria-label="Próximo mês"
            >
                <ChevronRight className="size-4" />
            </Button>
            {month !== currentMonth && (
                <Button
                    size="sm"
                    variant="outline"
                    className="ml-1 h-7 text-xs"
                    onClick={() => onChange(currentMonth)}
                >
                    Mês atual
                </Button>
            )}
        </div>
    );
}
