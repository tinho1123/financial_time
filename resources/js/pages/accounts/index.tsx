import { useForm } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
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
import type { Account, AccountType, BreadcrumbItem } from '@/types';

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

const CURRENCY_LOCALES: Record<string, string> = {
    BRL: 'pt-BR',
    USD: 'en-US',
    EUR: 'de-DE',
    GBP: 'en-GB',
    ARS: 'es-AR',
    JPY: 'ja-JP',
    CAD: 'en-CA',
    CHF: 'de-CH',
};

function formatAmountDisplay(value: string, currency: string): string {
    const num = parseFloat(value) || 0;
    const locale = CURRENCY_LOCALES[currency] ?? 'pt-BR';
    const decimals = currency === 'JPY' ? 0 : 2;
    return new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(num);
}

function AccountForm({ account, onSuccess }: AccountFormProps) {
    const isEditing = Boolean(account);
    const [amountFocused, setAmountFocused] = useState(false);

    const { data, setData, post, put, processing, errors } = useForm({
        name: account?.name ?? '',
        type: account?.type ?? 'checking',
        currency: account?.currency ?? 'BRL',
        initial_balance_in_cents: account
            ? (account.initial_balance_in_cents / 100).toFixed(2)
            : '0.00',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (isEditing && account) {
            put(accountsRoute.update.url(account.id), {
                onSuccess: () => onSuccess?.(),
            });
        } else {
            post(accountsRoute.store.url(), { onSuccess: () => onSuccess?.() });
        }
    }

    function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
        let val = e.target.value.replace(/[^\d.,]/g, '');
        val = val.replace(',', '.');
        const parts = val.split('.');
        if (parts.length > 2) val = parts[0] + '.' + parts[1];
        setData('initial_balance_in_cents', val);
    }

    function handleAmountBlur() {
        const num =
            parseFloat(
                String(data.initial_balance_in_cents).replace(',', '.'),
            ) || 0;
        const decimals = data.currency === 'JPY' ? 0 : 2;
        setData(
            'initial_balance_in_cents',
            decimals === 0 ? String(Math.round(num)) : num.toFixed(decimals),
        );
        setAmountFocused(false);
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
                {errors.name && (
                    <p className="text-xs text-destructive">{errors.name}</p>
                )}
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="acc-type">Tipo</Label>
                <select
                    id="acc-type"
                    value={data.type}
                    onChange={(e) =>
                        setData('type', e.target.value as AccountType)
                    }
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                    {Object.entries(ACCOUNT_TYPE_LABELS).map(
                        ([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ),
                    )}
                </select>
                {errors.type && (
                    <p className="text-xs text-destructive">{errors.type}</p>
                )}
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="acc-currency">Moeda</Label>
                <select
                    id="acc-currency"
                    value={data.currency}
                    onChange={(e) => setData('currency', e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                    <option value="BRL">BRL — Real Brasileiro (R$)</option>
                    <option value="USD">USD — Dólar Americano ($)</option>
                    <option value="EUR">EUR — Euro (€)</option>
                    <option value="GBP">GBP — Libra Esterlina (£)</option>
                    <option value="ARS">ARS — Peso Argentino</option>
                    <option value="JPY">JPY — Iene Japonês (¥)</option>
                    <option value="CAD">CAD — Dólar Canadense</option>
                    <option value="CHF">CHF — Franco Suíço</option>
                </select>
                {errors.currency && (
                    <p className="text-xs text-destructive">
                        {errors.currency}
                    </p>
                )}
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="acc-balance">
                    Saldo inicial ({data.currency})
                </Label>
                <Input
                    id="acc-balance"
                    type="text"
                    inputMode="decimal"
                    value={
                        amountFocused
                            ? data.initial_balance_in_cents
                            : formatAmountDisplay(
                                  data.initial_balance_in_cents,
                                  data.currency,
                              )
                    }
                    onFocus={() => setAmountFocused(true)}
                    onBlur={handleAmountBlur}
                    onChange={handleAmountChange}
                    aria-invalid={Boolean(errors.initial_balance_in_cents)}
                />
                {errors.initial_balance_in_cents && (
                    <p className="text-xs text-destructive">
                        {errors.initial_balance_in_cents}
                    </p>
                )}
            </div>

            <Button type="submit" disabled={processing} className="w-full">
                {isEditing ? 'Salvar' : 'Criar conta'}
            </Button>
        </form>
    );
}

function AccountCard({
    account,
    onEdit,
}: {
    account: Account;
    onEdit: (a: Account) => void;
}) {
    const { delete: destroy, processing } = useForm();

    function handleDelete() {
        if (
            !confirm(
                `Excluir a conta "${account.name}"? Todas as transações também serão excluídas.`,
            )
        ) {
            return;
        }
        destroy(accountsRoute.destroy.url(account.id));
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-base">
                            {account.name}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                            {ACCOUNT_TYPE_LABELS[account.type]}
                        </p>
                    </div>
                    <div className="flex gap-1">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="size-8"
                            onClick={() => onEdit(account)}
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
            </CardHeader>
            <CardContent>
                <AmountDisplay
                    amountInCents={Math.abs(account.current_balance_in_cents)}
                    type={
                        account.current_balance_in_cents >= 0
                            ? 'income'
                            : 'expense'
                    }
                    className="text-2xl"
                />
                <p className="mt-0.5 text-xs text-muted-foreground">
                    Saldo atual
                </p>
            </CardContent>
        </Card>
    );
}

export default function AccountsIndex({
    accounts,
    canAddMore,
}: AccountsPageProps) {
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
                    <Button
                        disabled={!canAddMore}
                        onClick={() => setCreateOpen(true)}
                    >
                        <Plus className="size-4" />
                        Nova conta
                    </Button>
                </div>

                {accounts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Nenhuma conta cadastrada.
                    </p>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {accounts.map((account) => (
                            <AccountCard
                                key={account.id}
                                account={account}
                                onEdit={setEditAccount}
                            />
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

            <Dialog
                open={Boolean(editAccount)}
                onOpenChange={(open) => !open && setEditAccount(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar conta</DialogTitle>
                    </DialogHeader>
                    {editAccount && (
                        <AccountForm
                            account={editAccount}
                            onSuccess={() => setEditAccount(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
