import { useForm } from '@inertiajs/react';
import { Head, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { AmountDisplay } from '@/components/amount-display';
import { TransactionForm } from '@/components/transaction-form';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import transactionsRoute from '@/routes/transactions';
import type {
    Account,
    BreadcrumbItem,
    Category,
    PaginatedTransactions,
    Transaction,
} from '@/types';

interface TransactionsPageProps {
    transactions: PaginatedTransactions;
    accounts: Account[];
    incomeCategories: Category[];
    expenseCategories: Category[];
    filters: {
        type?: string;
        category_id?: string;
        account_id?: string;
        from?: string;
        to?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Transações', href: transactionsRoute.index.url() },
];

export default function TransactionsIndex({
    transactions,
    accounts,
    incomeCategories,
    expenseCategories,
    filters,
}: TransactionsPageProps) {
    const [createOpen, setCreateOpen] = useState(false);
    const [editTransaction, setEditTransaction] = useState<Transaction | null>(
        null,
    );

    const allCategories = [...incomeCategories, ...expenseCategories];

    function handleFilter(key: string, value: string) {
        router.get(
            transactionsRoute.index.url(),
            { ...filters, [key]: value || undefined },
            { preserveState: true, replace: true },
        );
    }

    function handlePageChange(url: string | null) {
        if (url) {
            router.visit(url, { preserveState: true });
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Transações" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex flex-wrap items-center gap-2">
                    <select
                        value={filters.type ?? ''}
                        onChange={(e) => handleFilter('type', e.target.value)}
                        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                        <option value="">Todos os tipos</option>
                        <option value="income">Receitas</option>
                        <option value="expense">Despesas</option>
                    </select>

                    <select
                        value={filters.account_id ?? ''}
                        onChange={(e) =>
                            handleFilter('account_id', e.target.value)
                        }
                        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                        <option value="">Todas as contas</option>
                        {accounts.map((a) => (
                            <option key={a.id} value={a.id}>
                                {a.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={filters.category_id ?? ''}
                        onChange={(e) =>
                            handleFilter('category_id', e.target.value)
                        }
                        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                        <option value="">Todas as categorias</option>
                        {allCategories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>

                    <Input
                        type="date"
                        value={filters.from ?? ''}
                        onChange={(e) => handleFilter('from', e.target.value)}
                        className="h-9 w-auto"
                        placeholder="De"
                    />
                    <Input
                        type="date"
                        value={filters.to ?? ''}
                        onChange={(e) => handleFilter('to', e.target.value)}
                        className="h-9 w-auto"
                        placeholder="Até"
                    />

                    <Button
                        className="ml-auto"
                        onClick={() => setCreateOpen(true)}
                    >
                        <Plus className="size-4" />
                        Nova transação
                    </Button>
                </div>

                <div className="rounded-lg border">
                    {transactions.data.length === 0 ? (
                        <p className="p-6 text-center text-sm text-muted-foreground">
                            Nenhuma transação encontrada.
                        </p>
                    ) : (
                        <div className="divide-y">
                            {transactions.data.map((tx) => (
                                <TransactionRow
                                    key={tx.id}
                                    transaction={tx}
                                    onEdit={setEditTransaction}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {transactions.last_page > 1 && (
                    <div className="flex justify-center gap-1">
                        {transactions.links.map((link, i) => (
                            <button
                                key={i}
                                onClick={() => handlePageChange(link.url)}
                                disabled={!link.url}
                                className={`rounded px-3 py-1.5 text-sm ${
                                    link.active
                                        ? 'bg-primary text-primary-foreground'
                                        : 'hover:bg-accent disabled:opacity-40'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Nova transação</DialogTitle>
                    </DialogHeader>
                    <TransactionForm
                        accounts={accounts}
                        incomeCategories={incomeCategories}
                        expenseCategories={expenseCategories}
                        onSuccess={() => setCreateOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            <Dialog
                open={Boolean(editTransaction)}
                onOpenChange={(open) => !open && setEditTransaction(null)}
            >
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Editar transação</DialogTitle>
                    </DialogHeader>
                    {editTransaction && (
                        <TransactionForm
                            transaction={editTransaction}
                            accounts={accounts}
                            incomeCategories={incomeCategories}
                            expenseCategories={expenseCategories}
                            onSuccess={() => setEditTransaction(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

function TransactionRow({
    transaction: tx,
    onEdit,
}: {
    transaction: Transaction;
    onEdit: (t: Transaction) => void;
}) {
    const { delete: destroy, processing } = useForm();

    function handleDelete() {
        if (!confirm('Excluir esta transação?')) {
            return;
        }
        destroy(transactionsRoute.destroy.url(tx.id));
    }

    return (
        <div className="flex items-center gap-4 px-4 py-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                {tx.category ? (
                    <span
                        className="size-3 rounded-full"
                        style={{ backgroundColor: tx.category.color }}
                    />
                ) : (
                    <span className="size-3 rounded-full bg-muted-foreground/30" />
                )}
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{tx.description}</p>
                <p className="text-xs text-muted-foreground">
                    {new Date(tx.date).toLocaleDateString('pt-BR')}
                    {tx.category && ` · ${tx.category.name}`}
                    {tx.account && ` · ${tx.account.name}`}
                </p>
            </div>
            <AmountDisplay
                amountInCents={tx.amount_in_cents}
                type={tx.type}
                showSign
                className="shrink-0"
            />
            <div className="flex shrink-0 gap-1">
                <Button
                    size="icon"
                    variant="ghost"
                    className="size-8"
                    onClick={() => onEdit(tx)}
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
