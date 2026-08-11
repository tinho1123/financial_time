import { useForm } from '@inertiajs/react';
import { Head, router } from '@inertiajs/react';
import { Pause, Pencil, Play, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { AmountDisplay } from '@/components/amount-display';
import { RecurringTransactionForm } from '@/components/recurring-transaction-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import recurringTransactionsRoute from '@/routes/recurring-transactions';
import type {
    Account,
    BreadcrumbItem,
    Category,
    RecurringFrequency,
    RecurringTransaction,
} from '@/types';

interface RecurringTransactionsPageProps {
    recurringTransactions: RecurringTransaction[];
    accounts: Account[];
    incomeCategories: Category[];
    expenseCategories: Category[];
}

const frequencyLabels: Record<RecurringFrequency, string> = {
    weekly: 'Semanal',
    monthly: 'Mensal',
    yearly: 'Anual',
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Transações recorrentes',
        href: recurringTransactionsRoute.index.url(),
    },
];

export default function RecurringTransactionsIndex({
    recurringTransactions,
    accounts,
    incomeCategories,
    expenseCategories,
}: RecurringTransactionsPageProps) {
    const [createOpen, setCreateOpen] = useState(false);
    const [editRecurring, setEditRecurring] =
        useState<RecurringTransaction | null>(null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Transações recorrentes" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold">
                            Transações recorrentes
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Lançamentos automáticos como salário, assinaturas e
                            aluguel.
                        </p>
                    </div>
                    <Button onClick={() => setCreateOpen(true)}>
                        <Plus className="size-4" />
                        Nova recorrência
                    </Button>
                </div>

                <div className="rounded-lg border">
                    {recurringTransactions.length === 0 ? (
                        <p className="p-6 text-center text-sm text-muted-foreground">
                            Nenhuma transação recorrente cadastrada.
                        </p>
                    ) : (
                        <div className="divide-y">
                            {recurringTransactions.map((rtx) => (
                                <RecurringTransactionRow
                                    key={rtx.id}
                                    recurringTransaction={rtx}
                                    onEdit={setEditRecurring}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Nova recorrência</DialogTitle>
                    </DialogHeader>
                    <RecurringTransactionForm
                        accounts={accounts}
                        incomeCategories={incomeCategories}
                        expenseCategories={expenseCategories}
                        onSuccess={() => setCreateOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            <Dialog
                open={Boolean(editRecurring)}
                onOpenChange={(open) => !open && setEditRecurring(null)}
            >
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Editar recorrência</DialogTitle>
                    </DialogHeader>
                    {editRecurring && (
                        <RecurringTransactionForm
                            recurringTransaction={editRecurring}
                            accounts={accounts}
                            incomeCategories={incomeCategories}
                            expenseCategories={expenseCategories}
                            onSuccess={() => setEditRecurring(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

function RecurringTransactionRow({
    recurringTransaction: rtx,
    onEdit,
}: {
    recurringTransaction: RecurringTransaction;
    onEdit: (r: RecurringTransaction) => void;
}) {
    const { delete: destroy, processing } = useForm();
    const [toggling, setToggling] = useState(false);

    function handleDelete() {
        if (!confirm('Excluir esta transação recorrente?')) {
            return;
        }
        destroy(recurringTransactionsRoute.destroy.url(rtx.id));
    }

    function handleToggleActive() {
        setToggling(true);
        router.put(
            recurringTransactionsRoute.update.url(rtx.id),
            {
                type: rtx.type,
                category_id: rtx.category_id ?? '',
                amount_in_cents: (rtx.amount_in_cents / 100).toFixed(2),
                description: rtx.description,
                notes: rtx.notes ?? '',
                frequency: rtx.frequency,
                end_date: rtx.end_date ?? '',
                is_active: !rtx.is_active,
            },
            { preserveScroll: true, onFinish: () => setToggling(false) },
        );
    }

    return (
        <div className="flex items-center gap-4 px-4 py-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                {rtx.category ? (
                    <span
                        className="size-3 rounded-full"
                        style={{ backgroundColor: rtx.category.color }}
                    />
                ) : (
                    <span className="size-3 rounded-full bg-muted-foreground/30" />
                )}
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">
                        {rtx.description}
                    </p>
                    <Badge variant="secondary">
                        {frequencyLabels[rtx.frequency]}
                    </Badge>
                    {!rtx.is_active && <Badge variant="outline">Pausada</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">
                    Próxima em{' '}
                    {new Date(rtx.next_due_date).toLocaleDateString('pt-BR')}
                    {rtx.category && ` · ${rtx.category.name}`}
                    {rtx.account && ` · ${rtx.account.name}`}
                </p>
            </div>
            <AmountDisplay
                amountInCents={rtx.amount_in_cents}
                type={rtx.type}
                showSign
                className="shrink-0"
            />
            <div className="flex shrink-0 gap-1">
                <Button
                    size="icon"
                    variant="ghost"
                    className="size-8"
                    onClick={handleToggleActive}
                    disabled={toggling}
                    title={rtx.is_active ? 'Pausar' : 'Retomar'}
                >
                    {rtx.is_active ? (
                        <Pause className="size-3.5" />
                    ) : (
                        <Play className="size-3.5" />
                    )}
                </Button>
                <Button
                    size="icon"
                    variant="ghost"
                    className="size-8"
                    onClick={() => onEdit(rtx)}
                >
                    <Pencil className="size-3.5" />
                </Button>
                <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 text-destructive hover:text-destructive"
                    onClick={handleDelete}
                    disabled={processing}
                >
                    <Trash2 className="size-3.5" />
                </Button>
            </div>
        </div>
    );
}
