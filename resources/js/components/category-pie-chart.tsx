import { useState } from 'react';
import { formatCurrency } from '@/lib/currency';
import type { CategoryBreakdown } from '@/types';

interface CategoryPieChartProps {
    data: CategoryBreakdown[];
}

const SIZE = 180;
const STROKE = 28;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP = 2;

export function CategoryPieChart({ data }: CategoryPieChartProps) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const total = data.reduce((sum, item) => sum + item.total_in_cents, 0);

    if (total === 0) {
        return null;
    }

    const showGap = data.length > 1;
    const segments = data.map((item, index) => {
        const length = (item.total_in_cents / total) * CIRCUMFERENCE;
        const offset = data
            .slice(0, index)
            .reduce(
                (sum, previous) =>
                    sum + (previous.total_in_cents / total) * CIRCUMFERENCE,
                0,
            );

        return {
            item,
            index,
            offset,
            length: showGap ? Math.max(length - GAP, 0.5) : length,
        };
    });

    const active = activeIndex !== null ? data[activeIndex] : null;

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative" style={{ width: SIZE, height: SIZE }}>
                <svg
                    viewBox={`0 0 ${SIZE} ${SIZE}`}
                    className="size-full -rotate-90"
                    role="img"
                    aria-label="Distribuição das despesas por categoria"
                >
                    <circle
                        cx={SIZE / 2}
                        cy={SIZE / 2}
                        r={RADIUS}
                        fill="none"
                        strokeWidth={STROKE}
                        className="stroke-muted"
                    />
                    {segments.map(({ item, index, length, offset }) => (
                        <circle
                            key={item.category_name}
                            cx={SIZE / 2}
                            cy={SIZE / 2}
                            r={RADIUS}
                            fill="none"
                            stroke={item.color}
                            strokeWidth={
                                activeIndex === index ? STROKE + 6 : STROKE
                            }
                            strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
                            strokeDashoffset={-offset}
                            className="cursor-pointer transition-all duration-200"
                            style={{
                                opacity:
                                    activeIndex === null ||
                                    activeIndex === index
                                        ? 1
                                        : 0.35,
                            }}
                            onMouseEnter={() => setActiveIndex(index)}
                            onMouseLeave={() => setActiveIndex(null)}
                            onClick={() =>
                                setActiveIndex(
                                    activeIndex === index ? null : index,
                                )
                            }
                        >
                            <title>
                                {`${item.category_name}: ${formatCurrency(item.total_in_cents)} (${item.percentage}%)`}
                            </title>
                        </circle>
                    ))}
                </svg>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
                    <span className="line-clamp-1 text-xs text-muted-foreground">
                        {active ? active.category_name : 'Total'}
                    </span>
                    <span className="text-base font-bold tabular-nums">
                        {formatCurrency(active ? active.total_in_cents : total)}
                    </span>
                    {active && (
                        <span className="text-xs text-muted-foreground">
                            {active.percentage}%
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
