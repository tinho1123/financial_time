import { Head, Link, usePage } from '@inertiajs/react';
import { TrendingDown, TrendingUp, Wallet, Lock } from 'lucide-react';
import { AmountDisplay } from '@/components/amount-display';
import { MonthlyChart } from '@/components/monthly-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/currency';
import { dashboard } from '@/routes';
import * as billing from '@/routes/billing';
import * as transactions from '@/routes/transactions';
import type { BreadcrumbItem, CategoryBreakdown, MonthlySummary, Transaction } from '@/types';

interface DashboardProps {
    totalIncomeInCents: number;
    totalExpenseInCents: number;
    netBalanceInCents: number;
    recentTransactions: Transaction[];
    monthlySummary: MonthlySummary[] | null;
    categoryBreakdown: CategoryBreakdown[] | null;
    isPaidPlan: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: dashboard.url() }];

const now = new Date();
const currentMonth = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

function UpgradePrompt() {
    return (
        <div className="flex h-full min-h-[180px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-amber-500/40 bg-amber-500/5 p-6 text-center">
            <Lock className="size-6 text-amber-500" />
            <div>
                <p className="text-sm font-medium text-amber-500">Disponível no plano pago</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Faça upgrade para ver gráficos avançados</p>
            </div>
            <Link
                href={billing.index.url()}
                className="mt-1 rounded-full bg-amber-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-amber-400"
            >
                Ver planos →
            </Link>
        </div>
    );
}

export default function Dashboard({
    totalIncomeInCents,
    totalExpenseInCents,
    netBalanceInCents,
    recentTransactions,
    monthlySummary,
    categoryBreakdown,
    isPaidPlan,
}: DashboardProps) {
    const { auth } = usePage().props;
    const firstName = (auth.user as { name: string }).name.split(' ')[0];
    const savingsRate =
        totalIncomeInCents > 0
            ? Math.round(((totalIncomeInCents - totalExpenseInCents) / totalIncomeInCents) * 100)
            : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-6 p-4 lg:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Olá, {firstName} 👋</h1>
                        <p className="text-sm capitalize text-muted-foreground">{currentMonth}</p>
                    </div>
                    <Link
                        href={transactions.index.url()}
                        className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400"
                    >
                        + Nova transação
                    </Link>
                </div>

                {/* Stat cards */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <Card className="overflow-hidden border-0 bg-emerald-500/10 ring-1 ring-emerald-500/20">
                        <CardContent className="p-5">
                            <div className="mb-3 flex items-center justify-between">
                                <span className="text-xs font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                                    Receitas
                                </span>
                                <div className="flex size-8 items-center justify-center rounded-full bg-emerald-500/20">
                                    <TrendingUp className="size-4 text-emerald-500" />
                                </div>
                            </div>
                            <AmountDisplay amountInCents={totalIncomeInCents} type="income" className="text-2xl font-bold" />
                            <p className="mt-1 text-xs text-muted-foreground">este mês</p>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-0 bg-red-500/10 ring-1 ring-red-500/20">
                        <CardContent className="p-5">
                            <div className="mb-3 flex items-center justify-between">
                                <span className="text-xs font-medium uppercase tracking-wide text-red-600 dark:text-red-400">
                                    Despesas
                                </span>
                                <div className="flex size-8 items-center justify-center rounded-full bg-red-500/20">
                                    <TrendingDown className="size-4 text-red-500" />
                                </div>
                            </div>
                            <AmountDisplay amountInCents={totalExpenseInCents} type="expense" className="text-2xl font-bold" />
                            <p className="mt-1 text-xs text-muted-foreground">
                                {savingsRate >= 0 ? `${savingsRate}% de economia` : 'acima das receitas'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card
                        className={`overflow-hidden border-0 ring-1 ${
                            netBalanceInCents >= 0
                                ? 'bg-blue-500/10 ring-blue-500/20'
                                : 'bg-orange-500/10 ring-orange-500/20'
                        }`}
                    >
                        <CardContent className="p-5">
                            <div className="mb-3 flex items-center justify-between">
                                <span
                                    className={`text-xs font-medium uppercase tracking-wide ${
                                        netBalanceInCents >= 0
                                            ? 'text-blue-600 dark:text-blue-400'
                                            : 'text-orange-600 dark:text-orange-400'
                                    }`}
                                >
                                    Saldo total
                                </span>
                                <div
                                    className={`flex size-8 items-center justify-center rounded-full ${
                                        netBalanceInCents >= 0 ? 'bg-blue-500/20' : 'bg-orange-500/20'
                                    }`}
                                >
                                    <Wallet
                                        className={`size-4 ${netBalanceInCents >= 0 ? 'text-blue-500' : 'text-orange-500'}`}
                                    />
                                </div>
                            </div>
                            <AmountDisplay
                                amountInCents={Math.abs(netBalanceInCents)}
                                type={netBalanceInCents >= 0 ? 'income' : 'expense'}
                                className="text-2xl font-bold"
                            />
                            <p className="mt-1 text-xs text-muted-foreground">em todas as contas</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts */}
                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold">Histórico — 6 meses</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isPaidPlan && monthlySummary ? (
                                <MonthlyChart data={monthlySummary} />
                            ) : (
                                <UpgradePrompt />
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold">Despesas por categoria</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isPaidPlan && categoryBreakdown ? (
                                categoryBreakdown.length === 0 ? (
                                    <p className="py-10 text-center text-sm text-muted-foreground">
                                        Nenhuma despesa registrada este mês.
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {categoryBreakdown.map((item) => (
                                            <div key={item.category_name} className="space-y-1.5">
                                                <div className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className="size-3 rounded-full"
                                                            style={{ backgroundColor: item.color }}
                                                        />
                                                        <span className="font-medium">{item.category_name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-muted-foreground">
                                                            {item.percentage}%
                                                        </span>
                                                        <span className="font-semibold">
                                                            {formatCurrency(item.total_in_cents)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-500"
                                                        style={{
                                                            width: `${item.percentage}%`,
                                                            backgroundColor: item.color,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            ) : (
                                <UpgradePrompt />
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Recent transactions */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-sm font-semibold">Transações recentes</CardTitle>
                        <Link
                            href={transactions.index.url()}
                            className="text-xs text-muted-foreground hover:text-foreground"
                        >
                            Ver todas →
                        </Link>
                    </CardHeader>
                    <CardContent className="p-0">
                        {recentTransactions.length === 0 ? (
                            <div className="py-12 text-center">
                                <p className="text-sm text-muted-foreground">Nenhuma transação registrada ainda.</p>
                                <Link
                                    href={transactions.index.url()}
                                    className="mt-3 inline-block text-sm font-medium text-emerald-500 hover:text-emerald-400"
                                >
                                    Adicionar primeira transação →
                                </Link>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {recentTransactions.map((tx) => (
                                    <div
                                        key={tx.id}
                                        className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-muted/30"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="flex size-9 shrink-0 items-center justify-center rounded-full"
                                                style={{
                                                    backgroundColor: tx.category
                                                        ? `${tx.category.color}22`
                                                        : tx.type === 'income'
                                                          ? '#10b98122'
                                                          : '#ef444422',
                                                }}
                                            >
                                                <span
                                                    className="size-3 rounded-full"
                                                    style={{
                                                        backgroundColor: tx.category
                                                            ? tx.category.color
                                                            : tx.type === 'income'
                                                              ? '#10b981'
                                                              : '#ef4444',
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium leading-tight">{tx.description}</p>
                                                <p className="mt-0.5 text-xs text-muted-foreground">
                                                    {new Date(tx.date + 'T12:00:00').toLocaleDateString('pt-BR', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                    })}
                                                    {tx.category && ` · ${tx.category.name}`}
                                                    {tx.account && ` · ${tx.account.name}`}
                                                </p>
                                            </div>
                                        </div>
                                        <AmountDisplay
                                            amountInCents={tx.amount_in_cents}
                                            type={tx.type}
                                            showSign
                                            className="text-sm font-semibold"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
