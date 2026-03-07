import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { AmountDisplay } from '@/components/amount-display';
import { PlanLimitBanner } from '@/components/plan-limit-banner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import accountsRoute from '@/routes/accounts';
import type { Account, BreadcrumbItem } from '@/types';

interface AccountsPageProps {
    accounts: Account[];
    canAddMore: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Contas', href: accountsRoute.index.url() },
];

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
    checking: 'Conta Corrente',
    savings: 'Poupança',
    cash: 'Dinheiro',
    credit: 'Crédito',
    investment: 'Investimento',
};

interface AccountFormProps {
    account?: Account;
    onSuccess?: () => void;
}

function AccountForm({ account, onSuccess }: AccountFormProps) {
    const isEditing = Boolean(account);

    const { data, setData, post, put, processing, errors } = useForm({
        name: account?.name ?? '',
        type: account?.type ?? 'checking',
        initial_balance_in_cents: account ? (account.initial_balance_in_cents / 100).toFixed(2) : '0.00',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const payload = {
            name: data.name,
            type: data.type,
            initial_balance_in_cents: Math.round(parseFloat(data.initial_balance_in_cents as string) * 100),
        };

        if (isEditing && account) {
            put(accountsRoute.update.url(account.id), {
                data: payload,
                onSuccess: () => onSuccess?.(),
            });
        } else {
            post(accountsRoute.store.url(), {
                data: payload,
                onSuccess: () => onSuccess?.(),
            });
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
                <Label htmlFor="acc-name">Nome</Label>
                <Input
                    id="acc-name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="Ex: Nubank"
                    aria-invalid={Boolean(errors.name)}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="acc-type">Tipo</Label>
                <select
                    id="acc-type"
                    value={data.type}
                    onChange={(e) => setData('type', e.target.value)}
                    className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                >
                    {Object.entries(ACCOUNT_TYPE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </select>
                {errors.type && <p className="text-xs text-destructive">{errors.type}</p>}
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="acc-balance">Saldo inicial (R$)</Label>
                <Input
                    id="acc-balance"
                    type="number"
                    step="0.01"
                    value={data.initial_balance_in_cents}
                    onChange={(e) => setData('initial_balance_in_cents', e.target.value)}
                    aria-invalid={Boolean(errors.initial_balance_in_cents)}
                />
                {errors.initial_balance_in_cents && (
                    <p className="text-xs text-destructive">{errors.initial_balance_in_cents}</p>
                )}
            </div>

            <Button type="submit" disabled={processing} className="w-full">
                {isEditing ? 'Salvar' : 'Criar conta'}
            </Button>
        </form>
    );
}

function AccountCard({ account, onEdit }: { account: Account; onEdit: (a: Account) => void }) {
    const { delete: destroy, processing } = useForm();

    function handleDelete() {
        if (!confirm(`Excluir a conta "${account.name}"? Todas as transações também serão excluídas.`)) {
            return;
        }
        destroy(accountsRoute.destroy.url(account.id));
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-base">{account.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">{ACCOUNT_TYPE_LABELS[account.type]}</p>
                    </div>
                    <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="size-8" onClick={() => onEdit(account)}>
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
            </CardHeader>
            <CardContent>
                <AmountDisplay
                    amountInCents={Math.abs(account.current_balance_in_cents)}
                    type={account.current_balance_in_cents >= 0 ? 'income' : 'expense'}
                    className="text-2xl"
                />
                <p className="mt-0.5 text-xs text-muted-foreground">Saldo atual</p>
            </CardContent>
        </Card>
    );
}

export default function AccountsIndex({ accounts, canAddMore }: AccountsPageProps) {
    const [createOpen, setCreateOpen] = useState(false);
    const [editAccount, setEditAccount] = useState<Account | null>(null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Contas" />
            <div className="flex flex-col gap-6 p-4">
                {!canAddMore && (
                    <PlanLimitBanner message="Você atingiu o limite de 1 conta do plano gratuito." />
                )}

                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-semibold">Suas contas</h1>
                    <Button disabled={!canAddMore} onClick={() => setCreateOpen(true)}>
                        <Plus className="size-4" />
                        Nova conta
                    </Button>
                </div>

                {accounts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhuma conta cadastrada.</p>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {accounts.map((account) => (
                            <AccountCard key={account.id} account={account} onEdit={setEditAccount} />
                        ))}
                    </div>
                )}
            </div>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nova conta</DialogTitle>
                    </DialogHeader>
                    <AccountForm onSuccess={() => setCreateOpen(false)} />
                </DialogContent>
            </Dialog>

            <Dialog open={Boolean(editAccount)} onOpenChange={(open) => !open && setEditAccount(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar conta</DialogTitle>
                    </DialogHeader>
                    {editAccount && (
                        <AccountForm account={editAccount} onSuccess={() => setEditAccount(null)} />
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
