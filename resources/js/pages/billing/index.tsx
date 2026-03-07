import { useForm } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { CheckCircle2, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/currency';
import billingRoute from '@/routes/billing';
import type { BreadcrumbItem, Plan } from '@/types';

interface BillingPageProps {
    plans: Plan[];
    currentPlan: Plan | null;
    isSubscribed: boolean;
    onGracePeriod: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Cobrança', href: billingRoute.index.url() },
];

function PlanCard({
    plan,
    currentPlan,
    isSubscribed,
    onGracePeriod,
}: {
    plan: Plan;
    currentPlan: Plan | null;
    isSubscribed: boolean;
    onGracePeriod: boolean;
}) {
    const { post, processing } = useForm();
    const isCurrent = currentPlan?.id === plan.id;
    const isFree = plan.interval === 'free';

    const features: Record<string, string[]> = {
        free: ['1 conta bancária', '5 categorias', 'Transações ilimitadas'],
        monthly: ['Contas ilimitadas', 'Categorias ilimitadas', 'Transações ilimitadas', 'Gráfico histórico (6 meses)', 'Breakdown por categoria'],
        annual: ['Contas ilimitadas', 'Categorias ilimitadas', 'Transações ilimitadas', 'Gráfico histórico (6 meses)', 'Breakdown por categoria', 'Melhor custo-benefício'],
    };

    function handleCheckout() {
        post(billingRoute.checkout.url(plan.id));
    }

    function handlePortal() {
        window.location.href = billingRoute.portal.url();
    }

    return (
        <Card className={`flex flex-col ${isCurrent ? 'border-primary ring-2 ring-primary' : ''}`}>
            <CardHeader>
                <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <div className="flex flex-wrap gap-1">
                        {isCurrent && <Badge variant="default">Plano atual</Badge>}
                        {plan.promo_price_in_cents && plan.interval === 'monthly' && (
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
                                        {formatCurrency(plan.promo_price_in_cents)}
                                        <span className="text-base font-normal text-muted-foreground">/mês</span>
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        nos {plan.promo_months} primeiros meses, depois{' '}
                                        <span className="font-medium">{formatCurrency(plan.price_in_cents)}/mês</span>
                                    </p>
                                </>
                            ) : (
                                <p className="text-3xl font-bold">
                                    {formatCurrency(plan.price_in_cents)}
                                    <span className="text-base font-normal text-muted-foreground">/mês</span>
                                </p>
                            )}
                        </>
                    ) : (
                        <>
                            <p className="text-3xl font-bold">
                                {formatCurrency(plan.price_in_cents)}
                                <span className="text-base font-normal text-muted-foreground">/ano</span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                                equivale a{' '}
                                <span className="font-medium text-green-600 dark:text-green-400">
                                    {formatCurrency(Math.round(plan.price_in_cents / 12))}/mês
                                </span>
                            </p>
                        </>
                    )}
                </div>
            </CardHeader>

            <CardContent className="flex-1">
                <ul className="space-y-2">
                    {(features[plan.interval] ?? []).map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="size-4 shrink-0 text-green-500" />
                            {feature}
                        </li>
                    ))}
                </ul>
            </CardContent>

            <CardFooter>
                {isFree ? (
                    isCurrent && !isSubscribed ? (
                        <Button variant="outline" className="w-full" disabled>
                            Plano atual
                        </Button>
                    ) : (
                        <Button variant="outline" className="w-full" disabled>
                            Grátis
                        </Button>
                    )
                ) : isCurrent && isSubscribed ? (
                    <Button variant="outline" className="w-full" onClick={handlePortal}>
                        <ExternalLink className="size-4" />
                        Gerenciar assinatura
                    </Button>
                ) : (
                    <Button className="w-full" onClick={handleCheckout} disabled={processing}>
                        {onGracePeriod ? 'Reativar' : 'Assinar'}
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}

export default function BillingIndex({ plans, currentPlan, isSubscribed, onGracePeriod }: BillingPageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Cobrança" />
            <div className="flex flex-col gap-6 p-4">
                <div>
                    <h1 className="text-2xl font-bold">Planos</h1>
                    <p className="text-sm text-muted-foreground">Escolha o plano ideal para você.</p>
                </div>

                {onGracePeriod && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-300">
                        Sua assinatura foi cancelada mas ainda está ativa até o final do período pago.
                    </div>
                )}

                <div className="grid gap-4 md:grid-cols-3">
                    {plans.map((plan) => (
                        <PlanCard
                            key={plan.id}
                            plan={plan}
                            currentPlan={currentPlan}
                            isSubscribed={isSubscribed}
                            onGracePeriod={onGracePeriod}
                        />
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
