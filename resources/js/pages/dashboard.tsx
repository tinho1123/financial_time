import { Head } from '@inertiajs/react';
import { AmountDisplay } from '@/components/amount-display';
import { MonthlyChart } from '@/components/monthly-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/currency';
import { dashboard } from '@/routes';
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

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard.url() },
];

export default function Dashboard({
    totalIncomeInCents,
    totalExpenseInCents,
    netBalanceInCents,
    recentTransactions,
    monthlySummary,
    categoryBreakdown,
    isPaidPlan,
}: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-6 p-4">
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Receitas do mês</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <AmountDisplay amountInCents={totalIncomeInCents} type="income" className="text-2xl" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Despesas do mês</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <AmountDisplay amountInCents={totalExpenseInCents} type="expense" className="text-2xl" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo do mês</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <AmountDisplay
                                amountInCents={Math.abs(netBalanceInCents)}
                                type={netBalanceInCents >= 0 ? 'income' : 'expense'}
                                className="text-2xl"
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    {isPaidPlan && monthlySummary ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Histórico (6 meses)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <MonthlyChart data={monthlySummary} />
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="flex items-center justify-center">
                            <CardContent className="py-12 text-center text-sm text-muted-foreground">
                                Gráfico histórico disponível apenas no plano pago.
                            </CardContent>
                        </Card>
                    )}

                    {isPaidPlan && categoryBreakdown ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Por categoria (mês atual)</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {categoryBreakdown.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">Nenhuma despesa registrada.</p>
                                ) : (
                                    categoryBreakdown.map((item) => (
                                        <div key={item.category_name} className="space-y-1">
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className="size-2.5 rounded-full"
                                                        style={{ backgroundColor: item.color }}
                                                    />
                                                    <span>{item.category_name}</span>
                                                </div>
                                                <span className="font-medium">{formatCurrency(item.total_in_cents)}</span>
                                            </div>
                                            <div className="h-1.5 w-full rounded-full bg-muted">
                                                <div
                                                    className="h-full rounded-full"
                                                    style={{
                                                        width: `${item.percentage}%`,
                                                        backgroundColor: item.color,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="flex items-center justify-center">
                            <CardContent className="py-12 text-center text-sm text-muted-foreground">
                                Breakdown por categoria disponível apenas no plano pago.
                            </CardContent>
                        </Card>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Transações recentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentTransactions.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Nenhuma transação encontrada.</p>
                        ) : (
                            <div className="divide-y">
                                {recentTransactions.map((tx) => (
                                    <div key={tx.id} className="flex items-center justify-between py-3">
                                        <div className="flex items-center gap-3">
                                            {tx.category && (
                                                <span
                                                    className="size-2.5 rounded-full"
                                                    style={{ backgroundColor: tx.category.color }}
                                                />
                                            )}
                                            <div>
                                                <p className="text-sm font-medium">{tx.description}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(tx.date).toLocaleDateString('pt-BR')}
                                                    {tx.account && ` · ${tx.account.name}`}
                                                </p>
                                            </div>
                                        </div>
                                        <AmountDisplay amountInCents={tx.amount_in_cents} type={tx.type} showSign />
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
