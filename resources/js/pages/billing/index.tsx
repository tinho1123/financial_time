import { router, useForm } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { CheckCircle2, CreditCard, QrCode } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatUsdCurrency } from '@/lib/currency';
import billingRoute from '@/routes/billing';
import type { BreadcrumbItem, Plan } from '@/types';

interface BillingPageProps {
    plans: Plan[];
    currentPlan: Plan | null;
    planExpiresAt: string | null;
    isPaidPlan: boolean;
    isCreemSubscriber: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Cobrança', href: billingRoute.index.url() },
];

function PlanCard({
    plan,
    currentPlan,
    isPaidPlan,
    isCreemSubscriber,
}: {
    plan: Plan;
    currentPlan: Plan | null;
    isPaidPlan: boolean;
    isCreemSubscriber: boolean;
}) {
    const { post, processing } = useForm();
    const isCurrent = currentPlan?.id === plan.id;
    const isFree = plan.interval === 'free';

    const features: Record<string, string[]> = {
        free: ['1 conta bancária', '5 categorias', 'Transações ilimitadas'],
        monthly: [
            'Contas ilimitadas',
            'Categorias ilimitadas',
            'Transações ilimitadas',
            'Gráfico histórico (6 meses)',
            'Breakdown por categoria',
        ],
        annual: [
            'Contas ilimitadas',
            'Categorias ilimitadas',
            'Transações ilimitadas',
            'Gráfico histórico (6 meses)',
            'Breakdown por categoria',
            'Melhor custo-benefício',
        ],
    };

    function handlePixCheckout() {
        post(billingRoute.checkout.url(plan.id));
    }

    function handleCreemCheckout() {
        post(billingRoute.creem.url(plan.id));
    }

    function handlePortal() {
        router.get(billingRoute.portal.url());
    }

    const isCurrentAndPaid = isCurrent && isPaidPlan;

    return (
        <Card
            className={`flex flex-col ${isCurrent ? 'border-primary ring-2 ring-primary' : ''}`}
        >
            <CardHeader>
                <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <div className="flex flex-wrap gap-1">
                        {isCurrent && (
                            <Badge variant="default">Plano atual</Badge>
                        )}
                        {plan.promo_price_in_cents &&
                            plan.interval === 'monthly' && (
                                <Badge variant="secondary">Promoção</Badge>
                            )}
                    </div>
                </div>
                <div className="mt-2">
                    {isFree ? (
                        <p className="text-3xl font-bold">Grátis</p>
                    ) : plan.interval === 'monthly' ? (
                        <>
                            {plan.promo_price_in_cents ? (
                                <>
                                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                        {formatCurrency(
                                            plan.promo_price_in_cents,
                                        )}
                                        <span className="text-base font-normal text-muted-foreground">
                                            /mês
                                        </span>
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        nos {plan.promo_months} primeiros meses,
                                        depois{' '}
                                        <span className="font-medium">
                                            {formatCurrency(
                                                plan.price_in_cents,
                                            )}
                                            /mês
                                        </span>
                                    </p>
                                </>
                            ) : (
                                <p className="text-3xl font-bold">
                                    {formatCurrency(plan.price_in_cents)}
                                    <span className="text-base font-normal text-muted-foreground">
                                        /mês
                                    </span>
                                </p>
                            )}
                        </>
                    ) : (
                        <>
                            <p className="text-3xl font-bold">
                                {formatCurrency(plan.price_in_cents)}
                                <span className="text-base font-normal text-muted-foreground">
                                    /ano
                                </span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                                equivale a{' '}
                                <span className="font-medium text-green-600 dark:text-green-400">
                                    {formatCurrency(
                                        Math.round(plan.price_in_cents / 12),
                                    )}
                                    /mês
                                </span>
                            </p>
                        </>
                    )}
                </div>
            </CardHeader>

            <CardContent className="flex-1">
                <ul className="space-y-2">
                    {(features[plan.interval] ?? []).map((feature) => (
                        <li
                            key={feature}
                            className="flex items-center gap-2 text-sm"
                        >
                            <CheckCircle2 className="size-4 shrink-0 text-green-500" />
                            {feature}
                        </li>
                    ))}
                </ul>
            </CardContent>

            <CardFooter className="flex flex-col gap-2">
                {isFree ? (
                    <Button variant="outline" className="w-full" disabled>
                        {isCurrent && !isPaidPlan ? 'Plano atual' : 'Grátis'}
                    </Button>
                ) : isCurrentAndPaid && isCreemSubscriber ? (
                    <Button variant="outline" className="w-full" onClick={handlePortal}>
                        <CreditCard className="mr-2 size-4" />
                        Gerenciar assinatura
                    </Button>
                ) : isCurrentAndPaid ? (
                    <Button variant="outline" className="w-full" disabled>
                        Plano ativo
                    </Button>
                ) : (
                    <>
                        <Button
                            className="w-full"
                            onClick={handlePixCheckout}
                            disabled={processing}
                        >
                            <QrCode className="mr-2 size-4" />
                            Pagar via PIX
                        </Button>
                        {plan.has_creem_checkout && (
                            <Button variant="outline" className="w-full" onClick={handleCreemCheckout} disabled={processing}>
                                <CreditCard className="mr-2 size-4" />
                                Pagar com Cartão
                                {plan.usd_price_in_cents && (
                                    <span className="ml-1 text-xs text-muted-foreground">
                                        ({formatUsdCurrency(plan.usd_price_in_cents)}{plan.interval === 'annual' ? '/yr' : '/mo'})
                                    </span>
                                )}
                            </Button>
                        )}
                    </>
                )}
            </CardFooter>
        </Card>
    );
}

export default function BillingIndex({ plans, currentPlan, planExpiresAt, isPaidPlan, isCreemSubscriber }: BillingPageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Cobrança" />
            <div className="flex flex-col gap-6 p-4">
                <div>
                    <h1 className="text-2xl font-bold">Planos</h1>
                    <p className="text-sm text-muted-foreground">
                        Escolha o plano ideal para você.
                    </p>
                </div>

                {isPaidPlan && planExpiresAt && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-900/20 dark:text-emerald-300">
                        Seu plano está ativo até{' '}
                        <span className="font-medium">
                            {new Date(planExpiresAt).toLocaleDateString(
                                'pt-BR',
                                {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric',
                                },
                            )}
                        </span>
                        .
                    </div>
                )}

                {isPaidPlan && isCreemSubscriber && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-800/40 dark:bg-blue-900/20 dark:text-blue-300">
                        Assinatura ativa via cartão — renovação automática.
                    </div>
                )}

                <div className="grid gap-4 md:grid-cols-3">
                    {plans.map((plan) => (
                        <PlanCard
                            key={plan.id}
                            plan={plan}
                            currentPlan={currentPlan}
                            isPaidPlan={isPaidPlan}
                            isCreemSubscriber={isCreemSubscriber}
                        />
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
