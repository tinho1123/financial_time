import { Head, Link } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import billingRoute from '@/routes/billing';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Cobrança', href: billingRoute.index.url() },
    { title: 'Pagamento confirmado', href: billingRoute.success.url() },
];

export default function BillingSuccess() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pagamento confirmado" />
            <div className="flex flex-1 flex-col items-center justify-center gap-6 py-20 text-center">
                <CheckCircle2 className="size-16 text-green-500" />
                <div>
                    <h1 className="text-2xl font-bold">
                        Pagamento confirmado!
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Sua assinatura foi ativada com sucesso. Aproveite todos
                        os recursos.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button asChild>
                        <Link href={dashboard.url()}>Ir para o Dashboard</Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href={billingRoute.index.url()}>
                            Ver meu plano
                        </Link>
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
