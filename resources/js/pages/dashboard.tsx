import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Gauge,
    Lock,
    Target,
    TrendingDown,
    TrendingUp,
    Users,
    Wallet,
} from 'lucide-react';
import { AmountDisplay } from '@/components/amount-display';
import { CategoryPieChart } from '@/components/category-pie-chart';
import { MonthSelector } from '@/components/month-selector';
import { MonthlyChart } from '@/components/monthly-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/currency';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import * as billing from '@/routes/billing';
import { edit as editCoupleSplit } from '@/routes/couple-split';
import goalsRoute from '@/routes/goals';
import * as transactions from '@/routes/transactions';
import type {
    BreadcrumbItem,
    CategoryBreakdown,
    CoupleSplit,
    Goal,
    MonthlySummary,
    Transaction,
} from '@/types';

interface DashboardProps {
    selectedMonth: string;
    currentMonth: string;
    totalIncomeInCents: number;
    totalExpenseInCents: number;
    netBalanceInCents: number;
    recentTransactions: Transaction[];
    monthlySummary: MonthlySummary[] | null;
    categoryBreakdown: CategoryBreakdown[] | null;
    coupleSplit: CoupleSplit | null;
    goals: Goal[];
    isPaidPlan: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard.url() },
];

function UpgradePrompt() {
    return (
        <div className="flex h-full min-h-[180px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-amber-500/40 bg-amber-500/5 p-6 text-center">
            <Lock className="size-6 text-amber-500" />
            <div>
                <p className="text-sm font-medium text-amber-500">
                    Disponível no plano pago
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                    Faça upgrade para ver gráficos avançados
                </p>
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
    selectedMonth,
    currentMonth,
    totalIncomeInCents,
    totalExpenseInCents,
    netBalanceInCents,
    recentTransactions,
    monthlySummary,
    categoryBreakdown,
    coupleSplit,
    goals,
    isPaidPlan,
}: DashboardProps) {
    const { auth } = usePage().props;
    const firstName = (auth.user as { name: string }).name.split(' ')[0];
    const savingsRate =
        totalIncomeInCents > 0
            ? Math.round(
                  ((totalIncomeInCents - totalExpenseInCents) /
                      totalIncomeInCents) *
                      100,
              )
            : 0;
    const commitmentRate =
        totalIncomeInCents > 0
            ? (totalExpenseInCents / totalIncomeInCents) * 100
            : null;

    function changeMonth(month: string) {
        router.get(
            dashboard.url({
                query: { month: month === currentMonth ? undefined : month },
            }),
            {},
            { preserveScroll: true, preserveState: true },
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-6 p-4 lg:p-6">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold">
                            Olá, {firstName} 👋
                        </h1>
                        <div className="-ml-2">
                            <MonthSelector
                                month={selectedMonth}
                                currentMonth={currentMonth}
                                onChange={changeMonth}
                            />
                        </div>
                    </div>
                    <Link
                        href={transactions.index.url()}
                        className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400"
                    >
                        + Nova transação
                    </Link>
                </div>

                {/* Stat cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="overflow-hidden border-0 bg-emerald-500/10 ring-1 ring-emerald-500/20">
                        <CardContent className="p-5">
                            <div className="mb-3 flex items-center justify-between">
                                <span className="text-xs font-medium tracking-wide text-emerald-600 uppercase dark:text-emerald-400">
                                    Receitas
                                </span>
                                <div className="flex size-8 items-center justify-center rounded-full bg-emerald-500/20">
                                    <TrendingUp className="size-4 text-emerald-500" />
                                </div>
                            </div>
                            <AmountDisplay
                                amountInCents={totalIncomeInCents}
                                type="income"
                                className="text-2xl font-bold"
                            />
                            <p className="mt-1 text-xs text-muted-foreground">
                                no mês
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-0 bg-red-500/10 ring-1 ring-red-500/20">
                        <CardContent className="p-5">
                            <div className="mb-3 flex items-center justify-between">
                                <span className="text-xs font-medium tracking-wide text-red-600 uppercase dark:text-red-400">
                                    Despesas
                                </span>
                                <div className="flex size-8 items-center justify-center rounded-full bg-red-500/20">
                                    <TrendingDown className="size-4 text-red-500" />
                                </div>
                            </div>
                            <AmountDisplay
                                amountInCents={totalExpenseInCents}
                                type="expense"
                                className="text-2xl font-bold"
                            />
                            <p className="mt-1 text-xs text-muted-foreground">
                                {savingsRate >= 0
                                    ? `${savingsRate}% de economia`
                                    : 'acima das receitas'}
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
                                    className={`text-xs font-medium tracking-wide uppercase ${
                                        netBalanceInCents >= 0
                                            ? 'text-blue-600 dark:text-blue-400'
                                            : 'text-orange-600 dark:text-orange-400'
                                    }`}
                                >
                                    Saldo total
                                </span>
                                <div
                                    className={`flex size-8 items-center justify-center rounded-full ${
                                        netBalanceInCents >= 0
                                            ? 'bg-blue-500/20'
                                            : 'bg-orange-500/20'
                                    }`}
                                >
                                    <Wallet
                                        className={`size-4 ${netBalanceInCents >= 0 ? 'text-blue-500' : 'text-orange-500'}`}
                                    />
                                </div>
                            </div>
                            <AmountDisplay
                                amountInCents={Math.abs(netBalanceInCents)}
                                type={
                                    netBalanceInCents >= 0
                                        ? 'income'
                                        : 'expense'
                                }
                                className="text-2xl font-bold"
                            />
                            <p className="mt-1 text-xs text-muted-foreground">
                                em todas as contas
                            </p>
                        </CardContent>
                    </Card>

                    <CommitmentCard rate={commitmentRate} />
                </div>

                {/* Charts */}
                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold">
                                Histórico — 6 meses
                            </CardTitle>
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
                            <CardTitle className="text-sm font-semibold">
                                Despesas por categoria
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isPaidPlan && categoryBreakdown ? (
                                categoryBreakdown.length === 0 ? (
                                    <p className="py-10 text-center text-sm text-muted-foreground">
                                        Nenhuma despesa registrada este mês.
                                    </p>
                                ) : (
                                    <div className="space-y-5">
                                        <CategoryPieChart
                                            data={categoryBreakdown}
                                        />
                                        <div className="space-y-3">
                                            {categoryBreakdown.map((item) => (
                                                <div
                                                    key={item.category_name}
                                                    className="space-y-1.5"
                                                >
                                                    <div className="flex items-center justify-between text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <span
                                                                className="size-3 rounded-full"
                                                                style={{
                                                                    backgroundColor:
                                                                        item.color,
                                                                }}
                                                            />
                                                            <span className="font-medium">
                                                                {
                                                                    item.category_name
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-muted-foreground">
                                                                {
                                                                    item.percentage
                                                                }
                                                                %
                                                            </span>
                                                            <span className="font-semibold">
                                                                {formatCurrency(
                                                                    item.total_in_cents,
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-500"
                                                            style={{
                                                                width: `${item.percentage}%`,
                                                                backgroundColor:
                                                                    item.color,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            ) : (
                                <UpgradePrompt />
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <CoupleSplitCard
                        coupleSplit={coupleSplit}
                        totalExpenseInCents={totalExpenseInCents}
                    />
                    <GoalsCard goals={goals} />
                </div>

                {/* Recent transactions */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-sm font-semibold">
                            Transações recentes
                        </CardTitle>
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
                                <p className="text-sm text-muted-foreground">
                                    Nenhuma transação neste mês.
                                </p>
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
                                                        backgroundColor:
                                                            tx.category
                                                                ? tx.category
                                                                      .color
                                                                : tx.type ===
                                                                    'income'
                                                                  ? '#10b981'
                                                                  : '#ef4444',
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <p className="text-sm leading-tight font-medium">
                                                    {tx.description}
                                                </p>
                                                <p className="mt-0.5 text-xs text-muted-foreground">
                                                    {new Date(
                                                        tx.date + 'T12:00:00',
                                                    ).toLocaleDateString(
                                                        'pt-BR',
                                                        {
                                                            day: '2-digit',
                                                            month: 'short',
                                                        },
                                                    )}
                                                    {tx.category &&
                                                        ` · ${tx.category.name}`}
                                                    {tx.account &&
                                                        ` · ${tx.account.name}`}
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

function CommitmentCard({ rate }: { rate: number | null }) {
    const tone =
        rate === null
            ? 'neutral'
            : rate > 90
              ? 'danger'
              : rate > 70
                ? 'warning'
                : 'ok';

    const styles = {
        neutral: {
            card: 'bg-muted/40 ring-border',
            label: 'text-muted-foreground',
            icon: 'bg-muted text-muted-foreground',
            bar: 'bg-muted-foreground',
        },
        ok: {
            card: 'bg-emerald-500/10 ring-emerald-500/20',
            label: 'text-emerald-600 dark:text-emerald-400',
            icon: 'bg-emerald-500/20 text-emerald-500',
            bar: 'bg-emerald-500',
        },
        warning: {
            card: 'bg-amber-500/10 ring-amber-500/20',
            label: 'text-amber-600 dark:text-amber-400',
            icon: 'bg-amber-500/20 text-amber-500',
            bar: 'bg-amber-500',
        },
        danger: {
            card: 'bg-red-500/10 ring-red-500/20',
            label: 'text-red-600 dark:text-red-400',
            icon: 'bg-red-500/20 text-red-500',
            bar: 'bg-red-500',
        },
    }[tone];

    return (
        <Card className={cn('overflow-hidden border-0 ring-1', styles.card)}>
            <CardContent className="p-5">
                <div className="mb-3 flex items-center justify-between">
                    <span
                        className={cn(
                            'text-xs font-medium tracking-wide uppercase',
                            styles.label,
                        )}
                    >
                        Comprometimento
                    </span>
                    <div
                        className={cn(
                            'flex size-8 items-center justify-center rounded-full',
                            styles.icon,
                        )}
                    >
                        <Gauge className="size-4" />
                    </div>
                </div>
                <p className="text-2xl font-bold tabular-nums">
                    {rate === null
                        ? '—'
                        : `${rate.toFixed(1).replace('.', ',')}%`}
                </p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-background/60">
                    <div
                        className={cn('h-full rounded-full', styles.bar)}
                        style={{ width: `${Math.min(100, rate ?? 0)}%` }}
                    />
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                    {rate === null
                        ? 'sem receitas no mês'
                        : 'das receitas vai para despesas'}
                </p>
            </CardContent>
        </Card>
    );
}

function CoupleSplitCard({
    coupleSplit,
    totalExpenseInCents,
}: {
    coupleSplit: CoupleSplit | null;
    totalExpenseInCents: number;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <Users className="size-4 text-muted-foreground" />
                    Rateio do casal
                </CardTitle>
                <Link
                    href={editCoupleSplit.url()}
                    className="text-xs text-muted-foreground hover:text-foreground"
                >
                    {coupleSplit ? 'Ajustar →' : 'Configurar →'}
                </Link>
            </CardHeader>
            <CardContent>
                {coupleSplit ? (
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Dividindo{' '}
                            <span className="font-semibold text-foreground">
                                {formatCurrency(totalExpenseInCents)}
                            </span>{' '}
                            de despesas proporcionalmente à renda:
                        </p>
                        <div className="flex h-3 w-full overflow-hidden rounded-full">
                            <div
                                className="h-full bg-blue-500"
                                style={{
                                    width: `${coupleSplit.own_share_percentage}%`,
                                }}
                            />
                            <div className="h-full flex-1 bg-violet-500" />
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <span className="size-2.5 rounded-full bg-blue-500" />
                                    Você ·{' '}
                                    {coupleSplit.own_share_percentage
                                        .toFixed(1)
                                        .replace('.', ',')}
                                    %
                                </div>
                                <p className="mt-0.5 font-semibold tabular-nums">
                                    {formatCurrency(
                                        coupleSplit.own_share_in_cents,
                                    )}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
                                    <span className="size-2.5 rounded-full bg-violet-500" />
                                    {coupleSplit.partner_name} ·{' '}
                                    {(100 - coupleSplit.own_share_percentage)
                                        .toFixed(1)
                                        .replace('.', ',')}
                                    %
                                </div>
                                <p className="mt-0.5 font-semibold tabular-nums">
                                    {formatCurrency(
                                        coupleSplit.partner_share_in_cents,
                                    )}
                                </p>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Simulação considerando todas as despesas do mês como
                            compartilhadas.
                        </p>
                    </div>
                ) : (
                    <div className="py-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            Divida as despesas do mês proporcionalmente à renda
                            de cada um.
                        </p>
                        <Link
                            href={editCoupleSplit.url()}
                            className="mt-3 inline-block text-sm font-medium text-emerald-500 hover:text-emerald-400"
                        >
                            Informar rendas →
                        </Link>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function GoalsCard({ goals }: { goals: Goal[] }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <Target className="size-4 text-muted-foreground" />
                    Metas
                </CardTitle>
                <Link
                    href={goalsRoute.index.url()}
                    className="text-xs text-muted-foreground hover:text-foreground"
                >
                    Ver todas →
                </Link>
            </CardHeader>
            <CardContent>
                {goals.length === 0 ? (
                    <div className="py-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            Nenhuma meta cadastrada.
                        </p>
                        <Link
                            href={goalsRoute.index.url()}
                            className="mt-3 inline-block text-sm font-medium text-emerald-500 hover:text-emerald-400"
                        >
                            Criar uma meta →
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {goals.map((goal) => (
                            <div key={goal.id} className="space-y-1.5">
                                <div className="flex items-center justify-between gap-2 text-sm">
                                    <span className="truncate font-medium">
                                        {goal.name}
                                    </span>
                                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                                        {formatCurrency(goal.saved_in_cents)} de{' '}
                                        {formatCurrency(goal.target_in_cents)}
                                    </span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                    <div
                                        className="h-full rounded-full bg-emerald-500 transition-all"
                                        style={{
                                            width: `${goal.percentage}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
