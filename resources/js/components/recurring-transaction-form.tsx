import { Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import accountsRoute from '@/routes/accounts';
import categoriesRoute from '@/routes/categories';
import recurringTransactions from '@/routes/recurring-transactions';
import type {
    Account,
    Category,
    RecurringFrequency,
    RecurringTransaction,
} from '@/types';

interface RecurringTransactionFormProps {
    recurringTransaction?: RecurringTransaction;
    accounts: Account[];
    incomeCategories: Category[];
    expenseCategories: Category[];
    onSuccess?: () => void;
}

const frequencyOptions: { value: string; label: string }[] = [
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensal' },
    { value: 'yearly', label: 'Anual' },
];

export function RecurringTransactionForm({
    recurringTransaction,
    accounts,
    incomeCategories,
    expenseCategories,
    onSuccess,
}: RecurringTransactionFormProps) {
    const isEditing = Boolean(recurringTransaction);

    const { data, setData, post, put, processing, errors } = useForm({
        type: recurringTransaction?.type ?? 'expense',
        account_id: recurringTransaction?.account_id ?? accounts[0]?.id ?? '',
        category_id: recurringTransaction?.category_id ?? '',
        amount_in_cents: recurringTransaction
            ? (recurringTransaction.amount_in_cents / 100).toFixed(2)
            : '',
        description: recurringTransaction?.description ?? '',
        notes: recurringTransaction?.notes ?? '',
        frequency: recurringTransaction?.frequency ?? 'monthly',
        start_date:
            recurringTransaction?.start_date ??
            new Date().toISOString().slice(0, 10),
        end_date: recurringTransaction?.end_date ?? '',
        is_active: recurringTransaction?.is_active ?? true,
    });

    if (!isEditing && accounts.length === 0) {
        return (
            <div className="space-y-4 py-6 text-center">
                <p className="text-sm text-muted-foreground">
                    Você precisa ter pelo menos uma conta para criar uma
                    transação recorrente.
                </p>
                <Button asChild>
                    <Link href={accountsRoute.index.url()}>Criar conta</Link>
                </Button>
            </div>
        );
    }

    const activeCategories =
        data.type === 'income' ? incomeCategories : expenseCategories;

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (isEditing && recurringTransaction) {
            put(recurringTransactions.update.url(recurringTransaction.id), {
                onSuccess: () => onSuccess?.(),
            });
        } else {
            post(recurringTransactions.store.url(), {
                onSuccess: () => onSuccess?.(),
            });
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
                <Label>Tipo</Label>
                <div className="flex gap-2">
                    {(['income', 'expense'] as const).map((t) => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => {
                                setData('type', t);
                                setData('category_id', '');
                            }}
                            className={`flex-1 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                                data.type === t
                                    ? t === 'income'
                                        ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                        : 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                    : 'border-input hover:bg-accent'
                            }`}
                        >
                            {t === 'income' ? 'Receita' : 'Despesa'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="rtx-account">Conta</Label>
                    <select
                        id="rtx-account"
                        value={data.account_id}
                        disabled={isEditing}
                        onChange={(e) =>
                            setData('account_id', Number(e.target.value))
                        }
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-invalid={Boolean(errors.account_id)}
                    >
                        {accounts.map((a) => (
                            <option key={a.id} value={a.id}>
                                {a.name}
                            </option>
                        ))}
                    </select>
                    {errors.account_id && (
                        <p className="text-xs text-destructive">
                            {errors.account_id}
                        </p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="rtx-amount">Valor</Label>
                    <Input
                        id="rtx-amount"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={data.amount_in_cents}
                        onChange={(e) =>
                            setData('amount_in_cents', e.target.value)
                        }
                        placeholder="0,00"
                        aria-invalid={Boolean(errors.amount_in_cents)}
                    />
                    {errors.amount_in_cents && (
                        <p className="text-xs text-destructive">
                            {errors.amount_in_cents}
                        </p>
                    )}
                </div>
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="rtx-desc">Descrição</Label>
                <Input
                    id="rtx-desc"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    placeholder="Ex: Assinatura streaming"
                    aria-invalid={Boolean(errors.description)}
                />
                {errors.description && (
                    <p className="text-xs text-destructive">
                        {errors.description}
                    </p>
                )}
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="rtx-category">Categoria</Label>
                <select
                    id="rtx-category"
                    value={data.category_id ?? ''}
                    onChange={(e) =>
                        setData(
                            'category_id',
                            e.target.value ? Number(e.target.value) : '',
                        )
                    }
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                    <option value="">Sem categoria</option>
                    {activeCategories.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>
                {activeCategories.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                        Sem categorias para este tipo.{' '}
                        <Link
                            href={categoriesRoute.index.url()}
                            className="underline hover:text-foreground"
                        >
                            Criar categoria
                        </Link>
                    </p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="rtx-frequency">Frequência</Label>
                    <select
                        id="rtx-frequency"
                        value={data.frequency}
                        onChange={(e) =>
                            setData(
                                'frequency',
                                e.target.value as RecurringFrequency,
                            )
                        }
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        aria-invalid={Boolean(errors.frequency)}
                    >
                        {frequencyOptions.map((f) => (
                            <option key={f.value} value={f.value}>
                                {f.label}
                            </option>
                        ))}
                    </select>
                    {errors.frequency && (
                        <p className="text-xs text-destructive">
                            {errors.frequency}
                        </p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="rtx-start">
                        {isEditing ? 'Início' : 'Primeira ocorrência'}
                    </Label>
                    <Input
                        id="rtx-start"
                        type="date"
                        value={data.start_date}
                        disabled={isEditing}
                        onChange={(e) => setData('start_date', e.target.value)}
                        aria-invalid={Boolean(errors.start_date)}
                    />
                    {errors.start_date && (
                        <p className="text-xs text-destructive">
                            {errors.start_date}
                        </p>
                    )}
                </div>
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="rtx-end">Terminar em (opcional)</Label>
                <Input
                    id="rtx-end"
                    type="date"
                    value={data.end_date}
                    onChange={(e) => setData('end_date', e.target.value)}
                    aria-invalid={Boolean(errors.end_date)}
                />
                {errors.end_date && (
                    <p className="text-xs text-destructive">
                        {errors.end_date}
                    </p>
                )}
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="rtx-notes">Observações (opcional)</Label>
                <Input
                    id="rtx-notes"
                    value={data.notes}
                    onChange={(e) => setData('notes', e.target.value)}
                    placeholder="Detalhes adicionais..."
                />
            </div>

            {isEditing && (
                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={data.is_active}
                        onChange={(e) => setData('is_active', e.target.checked)}
                        className="size-4 rounded border-input"
                    />
                    Recorrência ativa
                </label>
            )}

            <Button type="submit" disabled={processing} className="w-full">
                {isEditing ? 'Salvar alterações' : 'Criar recorrência'}
            </Button>
        </form>
    );
}
