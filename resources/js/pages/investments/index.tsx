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
import investmentsRoute from '@/routes/investments';
import type { Account, BreadcrumbItem } from '@/types';

interface InvestmentsPageProps {
    investments: Account[];
    totalInCents: number;
    canAddMore: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Investimentos', href: investmentsRoute.index.url() },
];

interface InvestmentFormProps {
    investment?: Account;
    onSuccess?: () => void;
}

function InvestmentForm({ investment, onSuccess }: InvestmentFormProps) {
    const isEditing = Boolean(investment);

    const { data, setData, post, put, processing, errors } = useForm({
        name: investment?.name ?? '',
        currency: investment?.currency ?? 'BRL',
        initial_balance_in_cents: investment
            ? (investment.initial_balance_in_cents / 100).toFixed(2)
            : '0.00',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (isEditing && investment) {
            put(investmentsRoute.update.url(investment.id), {
                onSuccess: () => onSuccess?.(),
            });
        } else {
            post(investmentsRoute.store.url(), {
                onSuccess: () => onSuccess?.(),
            });
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
                <Label htmlFor="inv-name">Nome</Label>
                <Input
                    id="inv-name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="Ex: Tesouro Selic, CDB, Ações"
                    aria-invalid={Boolean(errors.name)}
                />
                {errors.name && (
                    <p className="text-xs text-destructive">{errors.name}</p>
                )}
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="inv-currency">Moeda</Label>
                <select
                    id="inv-currency"
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
                <Label htmlFor="inv-balance">
                    Valor investido ({data.currency})
                </Label>
                <Input
                    id="inv-balance"
                    type="number"
                    step="0.01"
                    value={data.initial_balance_in_cents}
                    onChange={(e) =>
                        setData('initial_balance_in_cents', e.target.value)
                    }
                    aria-invalid={Boolean(errors.initial_balance_in_cents)}
                />
                {errors.initial_balance_in_cents && (
                    <p className="text-xs text-destructive">
                        {errors.initial_balance_in_cents}
                    </p>
                )}
            </div>

            <Button type="submit" disabled={processing} className="w-full">
                {isEditing ? 'Salvar' : 'Criar investimento'}
            </Button>
        </form>
    );
}

function InvestmentCard({
    investment,
    onEdit,
}: {
    investment: Account;
    onEdit: (a: Account) => void;
}) {
    const { delete: destroy, processing } = useForm();

    function handleDelete() {
        if (
            !confirm(
                `Excluir o investimento "${investment.name}"? Todas as transações também serão excluídas.`,
            )
        ) {
            return;
        }
        destroy(investmentsRoute.destroy.url(investment.id));
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                    <CardTitle className="text-base">
                        {investment.name}
                    </CardTitle>
                    <div className="flex gap-1">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="size-8"
                            onClick={() => onEdit(investment)}
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
                    amountInCents={Math.abs(
                        investment.current_balance_in_cents,
                    )}
                    type={
                        investment.current_balance_in_cents >= 0
                            ? 'income'
                            : 'expense'
                    }
                    className="text-2xl"
                />
                <p className="mt-0.5 text-xs text-muted-foreground">
                    Valor atual
                </p>
            </CardContent>
        </Card>
    );
}

export default function InvestmentsIndex({
    investments,
    totalInCents,
    canAddMore,
}: InvestmentsPageProps) {
    const [createOpen, setCreateOpen] = useState(false);
    const [editInvestment, setEditInvestment] = useState<Account | null>(null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Investimentos" />
            <div className="flex flex-col gap-6 p-4">
                {!canAddMore && (
                    <PlanLimitBanner message="Você atingiu o limite de 1 conta do plano gratuito." />
                )}

                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-semibold">Investimentos</h1>
                    <Button
                        disabled={!canAddMore}
                        onClick={() => setCreateOpen(true)}
                    >
                        <Plus className="size-4" />
                        Novo investimento
                    </Button>
                </div>

                {investments.length > 0 && (
                    <Card>
                        <CardContent className="py-4">
                            <AmountDisplay
                                amountInCents={Math.abs(totalInCents)}
                                type={totalInCents >= 0 ? 'income' : 'expense'}
                                className="text-3xl"
                            />
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                Total investido
                            </p>
                        </CardContent>
                    </Card>
                )}

                {investments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Nenhum investimento cadastrado.
                    </p>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {investments.map((investment) => (
                            <InvestmentCard
                                key={investment.id}
                                investment={investment}
                                onEdit={setEditInvestment}
                            />
                        ))}
                    </div>
                )}
            </div>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Novo investimento</DialogTitle>
                    </DialogHeader>
                    <InvestmentForm onSuccess={() => setCreateOpen(false)} />
                </DialogContent>
            </Dialog>

            <Dialog
                open={Boolean(editInvestment)}
                onOpenChange={(open) => !open && setEditInvestment(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar investimento</DialogTitle>
                    </DialogHeader>
                    {editInvestment && (
                        <InvestmentForm
                            investment={editInvestment}
                            onSuccess={() => setEditInvestment(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
