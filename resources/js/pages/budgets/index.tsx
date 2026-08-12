import { useForm } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { AmountDisplay } from '@/components/amount-display';
import { BudgetForm } from '@/components/budget-form';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import budgetsRoute from '@/routes/budgets';
import type { Budget, BreadcrumbItem, Category } from '@/types';

interface BudgetsPageProps {
    budgets: Budget[];
    availableCategories: Category[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Orçamentos', href: budgetsRoute.index.url() },
];

export default function BudgetsIndex({
    budgets,
    availableCategories,
}: BudgetsPageProps) {
    const [createOpen, setCreateOpen] = useState(false);
    const [editBudget, setEditBudget] = useState<Budget | null>(null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Orçamentos" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold">Orçamentos</h1>
                        <p className="text-sm text-muted-foreground">
                            Defina um limite mensal por categoria e acompanhe
                            quanto já foi gasto.
                        </p>
                    </div>
                    <Button onClick={() => setCreateOpen(true)}>
                        <Plus className="size-4" />
                        Novo orçamento
                    </Button>
                </div>

                {budgets.length === 0 ? (
                    <div className="rounded-lg border">
                        <p className="p-6 text-center text-sm text-muted-foreground">
                            Nenhum orçamento cadastrado.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {budgets.map((budget) => (
                            <BudgetCard
                                key={budget.id}
                                budget={budget}
                                onEdit={setEditBudget}
                            />
                        ))}
                    </div>
                )}
            </div>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Novo orçamento</DialogTitle>
                    </DialogHeader>
                    <BudgetForm
                        availableCategories={availableCategories}
                        onSuccess={() => setCreateOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            <Dialog
                open={Boolean(editBudget)}
                onOpenChange={(open) => !open && setEditBudget(null)}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Editar orçamento</DialogTitle>
                    </DialogHeader>
                    {editBudget && (
                        <BudgetForm
                            budget={editBudget}
                            availableCategories={availableCategories}
                            onSuccess={() => setEditBudget(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

function BudgetCard({
    budget,
    onEdit,
}: {
    budget: Budget;
    onEdit: (b: Budget) => void;
}) {
    const { delete: destroy, processing } = useForm();
    const isOverBudget = budget.percentage >= 100;
    const isNearLimit = budget.percentage >= 80 && !isOverBudget;
    const barWidth = Math.min(100, budget.percentage);

    function handleDelete() {
        if (!confirm('Excluir este orçamento?')) {
            return;
        }
        destroy(budgetsRoute.destroy.url(budget.id));
    }

    return (
        <div className="flex flex-col gap-3 rounded-lg border p-4">
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                    <span
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: budget.category.color }}
                    />
                    <p className="text-sm font-medium">
                        {budget.category.name}
                    </p>
                </div>
                <div className="flex shrink-0 gap-1">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="size-7"
                        onClick={() => onEdit(budget)}
                    >
                        <Pencil className="size-3.5" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="size-7 text-destructive hover:text-destructive"
                        onClick={handleDelete}
                        disabled={processing}
                    >
                        <Trash2 className="size-3.5" />
                    </Button>
                </div>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                    className={cn(
                        'h-full rounded-full transition-all',
                        isOverBudget
                            ? 'bg-red-600 dark:bg-red-500'
                            : isNearLimit
                              ? 'bg-amber-500 dark:bg-amber-400'
                              : 'bg-green-600 dark:bg-green-500',
                    )}
                    style={{ width: `${barWidth}%` }}
                />
            </div>

            <div className="flex items-center justify-between text-sm">
                <span
                    className={cn(
                        'font-medium tabular-nums',
                        isOverBudget && 'text-red-600 dark:text-red-400',
                    )}
                >
                    <AmountDisplay amountInCents={budget.spent_in_cents} /> de{' '}
                    <AmountDisplay amountInCents={budget.amount_in_cents} />
                </span>
                <span
                    className={cn(
                        'shrink-0 font-medium tabular-nums',
                        isOverBudget
                            ? 'text-red-600 dark:text-red-400'
                            : isNearLimit
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-muted-foreground',
                    )}
                >
                    {budget.percentage}%
                </span>
            </div>
        </div>
    );
}
