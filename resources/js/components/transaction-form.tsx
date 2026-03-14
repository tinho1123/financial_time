import { Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import accountsRoute from '@/routes/accounts';
import categoriesRoute from '@/routes/categories';
import transactions from '@/routes/transactions';
import type { Account, Category, Transaction } from '@/types';

interface TransactionFormProps {
    transaction?: Transaction;
    accounts: Account[];
    incomeCategories: Category[];
    expenseCategories: Category[];
    onSuccess?: () => void;
}

export function TransactionForm({
    transaction,
    accounts,
    incomeCategories,
    expenseCategories,
    onSuccess,
}: TransactionFormProps) {
    const isEditing = Boolean(transaction);

    const { data, setData, post, put, processing, errors } = useForm({
        type: transaction?.type ?? 'expense',
        account_id: transaction?.account_id ?? (accounts[0]?.id ?? ''),
        category_id: transaction?.category_id ?? '',
        amount_in_cents: transaction ? (transaction.amount_in_cents / 100).toFixed(2) : '',
        description: transaction?.description ?? '',
        date: transaction?.date ?? new Date().toISOString().slice(0, 10),
        notes: transaction?.notes ?? '',
    });

    if (!isEditing && accounts.length === 0) {
        return (
            <div className="space-y-4 py-6 text-center">
                <p className="text-sm text-muted-foreground">
                    Você precisa ter pelo menos uma conta para registrar uma transação.
                </p>
                <Button asChild>
                    <Link href={accountsRoute.index.url()}>Criar conta</Link>
                </Button>
            </div>
        );
    }

    const activeCategories = data.type === 'income' ? incomeCategories : expenseCategories;

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (isEditing && transaction) {
            put(transactions.update.url(transaction.id), { onSuccess: () => onSuccess?.() });
        } else {
            post(transactions.store.url(), { onSuccess: () => onSuccess?.() });
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
                    <Label htmlFor="tx-account">Conta</Label>
                    <select
                        id="tx-account"
                        value={data.account_id}
                        onChange={(e) => setData('account_id', Number(e.target.value))}
                        className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                        aria-invalid={Boolean(errors.account_id)}
                    >
                        {accounts.map((a) => (
                            <option key={a.id} value={a.id}>
                                {a.name}
                            </option>
                        ))}
                    </select>
                    {errors.account_id && <p className="text-xs text-destructive">{errors.account_id}</p>}
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="tx-amount">Valor</Label>
                    <Input
                        id="tx-amount"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={data.amount_in_cents}
                        onChange={(e) => setData('amount_in_cents', e.target.value)}
                        placeholder="0,00"
                        aria-invalid={Boolean(errors.amount_in_cents)}
                    />
                    {errors.amount_in_cents && <p className="text-xs text-destructive">{errors.amount_in_cents}</p>}
                </div>
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="tx-desc">Descrição</Label>
                <Input
                    id="tx-desc"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    placeholder="Ex: Supermercado"
                    aria-invalid={Boolean(errors.description)}
                />
                {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="tx-category">Categoria</Label>
                    <select
                        id="tx-category"
                        value={data.category_id ?? ''}
                        onChange={(e) => setData('category_id', e.target.value ? Number(e.target.value) : '')}
                        className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
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
                            <Link href={categoriesRoute.index.url()} className="underline hover:text-foreground">
                                Criar categoria
                            </Link>
                        </p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="tx-date">Data</Label>
                    <Input
                        id="tx-date"
                        type="date"
                        value={data.date}
                        onChange={(e) => setData('date', e.target.value)}
                        aria-invalid={Boolean(errors.date)}
                    />
                    {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
                </div>
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="tx-notes">Observações (opcional)</Label>
                <Input
                    id="tx-notes"
                    value={data.notes}
                    onChange={(e) => setData('notes', e.target.value)}
                    placeholder="Detalhes adicionais..."
                />
            </div>

            <Button type="submit" disabled={processing} className="w-full">
                {isEditing ? 'Salvar alterações' : 'Adicionar transação'}
            </Button>
        </form>
    );
}
