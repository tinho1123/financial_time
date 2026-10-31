import { Head, useForm } from '@inertiajs/react';
import { Minus, Pencil, Plus, Target, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { AmountDisplay } from '@/components/amount-display';
import { GoalForm } from '@/components/goal-form';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/currency';
import { cn } from '@/lib/utils';
import goalsRoute from '@/routes/goals';
import type { BreadcrumbItem, Goal } from '@/types';

interface GoalsPageProps {
    goals: Goal[];
    totalTargetInCents: number;
    totalSavedInCents: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Metas', href: goalsRoute.index.url() },
];

export default function GoalsIndex({
    goals,
    totalTargetInCents,
    totalSavedInCents,
}: GoalsPageProps) {
    const [createOpen, setCreateOpen] = useState(false);
    const [editGoal, setEditGoal] = useState<Goal | null>(null);
    const totalPercentage =
        totalTargetInCents > 0
            ? Math.min(
                  100,
                  Math.round((totalSavedInCents / totalTargetInCents) * 100),
              )
            : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Metas" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-lg font-semibold">Metas</h1>
                        <p className="text-sm text-muted-foreground">
                            Defina objetivos financeiros e registre quanto já
                            guardou para cada um.
                        </p>
                    </div>
                    <Button onClick={() => setCreateOpen(true)}>
                        <Plus className="size-4" />
                        Nova meta
                    </Button>
                </div>

                {goals.length > 0 && (
                    <div className="rounded-lg border p-4">
                        <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                            <span className="text-muted-foreground">
                                Total guardado em {goals.length}{' '}
                                {goals.length === 1 ? 'meta' : 'metas'}
                            </span>
                            <span className="font-medium tabular-nums">
                                <AmountDisplay
                                    amountInCents={totalSavedInCents}
                                />{' '}
                                de{' '}
                                <AmountDisplay
                                    amountInCents={totalTargetInCents}
                                />{' '}
                                · {totalPercentage}%
                            </span>
                        </div>
                        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                                className="h-full rounded-full bg-emerald-500 transition-all"
                                style={{ width: `${totalPercentage}%` }}
                            />
                        </div>
                    </div>
                )}

                {goals.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 rounded-lg border p-10 text-center">
                        <Target className="size-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                            Nenhuma meta cadastrada. Que tal começar pela
                            reserva de emergência?
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => setCreateOpen(true)}
                        >
                            Criar primeira meta
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {goals.map((goal) => (
                            <GoalCard
                                key={goal.id}
                                goal={goal}
                                onEdit={setEditGoal}
                            />
                        ))}
                    </div>
                )}
            </div>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Nova meta</DialogTitle>
                    </DialogHeader>
                    <GoalForm onSuccess={() => setCreateOpen(false)} />
                </DialogContent>
            </Dialog>

            <Dialog
                open={Boolean(editGoal)}
                onOpenChange={(open) => !open && setEditGoal(null)}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Editar meta</DialogTitle>
                    </DialogHeader>
                    {editGoal && (
                        <GoalForm
                            goal={editGoal}
                            onSuccess={() => setEditGoal(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

function monthlyAmountToReachGoal(goal: Goal): number | null {
    if (!goal.deadline) {
        return null;
    }

    const remaining = goal.target_in_cents - goal.saved_in_cents;

    if (remaining <= 0) {
        return null;
    }

    const today = new Date();
    const deadline = new Date(goal.deadline + 'T12:00:00');
    const monthsLeft = Math.max(
        1,
        (deadline.getFullYear() - today.getFullYear()) * 12 +
            (deadline.getMonth() - today.getMonth()),
    );

    return Math.ceil(remaining / monthsLeft);
}

function GoalCard({
    goal,
    onEdit,
}: {
    goal: Goal;
    onEdit: (goal: Goal) => void;
}) {
    const { delete: destroy, processing: deleting } = useForm();
    const contribution = useForm({ amount_in_cents: '' });
    const isComplete = goal.percentage >= 100;
    const remainingInCents = Math.max(
        0,
        goal.target_in_cents - goal.saved_in_cents,
    );
    const monthlyAmount = monthlyAmountToReachGoal(goal);

    function handleDelete() {
        if (!confirm('Excluir esta meta?')) {
            return;
        }
        destroy(goalsRoute.destroy.url(goal.id), { preserveScroll: true });
    }

    function handleContribute(direction: 1 | -1) {
        const value = Number(contribution.data.amount_in_cents);

        if (!value || value <= 0) {
            return;
        }

        contribution.transform(() => ({
            amount_in_cents: String(value * direction),
        }));
        contribution.post(goalsRoute.contribute.url(goal.id), {
            preserveScroll: true,
            onSuccess: () => contribution.reset(),
        });
    }

    return (
        <div className="flex flex-col gap-3 rounded-lg border p-4">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <p className="text-sm font-medium">{goal.name}</p>
                    {goal.deadline && (
                        <p className="text-xs text-muted-foreground">
                            Prazo:{' '}
                            {new Date(
                                goal.deadline + 'T12:00:00',
                            ).toLocaleDateString('pt-BR', {
                                month: 'short',
                                year: 'numeric',
                            })}
                        </p>
                    )}
                </div>
                <div className="flex shrink-0 gap-1">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="size-7"
                        onClick={() => onEdit(goal)}
                        aria-label="Editar meta"
                    >
                        <Pencil className="size-3.5" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="size-7 text-destructive hover:text-destructive"
                        onClick={handleDelete}
                        disabled={deleting}
                        aria-label="Excluir meta"
                    >
                        <Trash2 className="size-3.5" />
                    </Button>
                </div>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${goal.percentage}%` }}
                />
            </div>

            <div className="flex items-center justify-between text-sm">
                <span className="font-medium tabular-nums">
                    <AmountDisplay amountInCents={goal.saved_in_cents} /> de{' '}
                    <AmountDisplay amountInCents={goal.target_in_cents} />
                </span>
                <span
                    className={cn(
                        'shrink-0 font-medium tabular-nums',
                        isComplete
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-muted-foreground',
                    )}
                >
                    {isComplete ? 'Concluída 🎉' : `${goal.percentage}%`}
                </span>
            </div>

            {!isComplete && (
                <p className="text-xs text-muted-foreground">
                    Faltam {formatCurrency(remainingInCents)}
                    {monthlyAmount &&
                        ` · cerca de ${formatCurrency(monthlyAmount)}/mês até o prazo`}
                </p>
            )}

            <div className="flex gap-2">
                <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="Valor (R$)"
                    value={contribution.data.amount_in_cents}
                    onChange={(e) =>
                        contribution.setData('amount_in_cents', e.target.value)
                    }
                    aria-label={`Valor para a meta ${goal.name}`}
                    aria-invalid={Boolean(contribution.errors.amount_in_cents)}
                    className="h-8"
                />
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleContribute(-1)}
                    disabled={contribution.processing}
                    aria-label="Retirar valor"
                >
                    <Minus className="size-3.5" />
                </Button>
                <Button
                    size="sm"
                    onClick={() => handleContribute(1)}
                    disabled={contribution.processing}
                >
                    <Plus className="size-3.5" />
                    Guardar
                </Button>
            </div>
            {contribution.errors.amount_in_cents && (
                <p className="text-xs text-destructive">
                    {contribution.errors.amount_in_cents}
                </p>
            )}
        </div>
    );
}
