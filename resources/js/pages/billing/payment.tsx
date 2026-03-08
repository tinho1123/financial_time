import { Head, router } from '@inertiajs/react';
import { Copy, CheckCircle2, Clock } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/currency';
import billingRoute from '@/routes/billing';
import type { BreadcrumbItem, PixPayment } from '@/types';

interface PaymentPageProps {
    pixPayment: PixPayment;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Cobrança', href: billingRoute.index.url() },
    { title: 'Pagamento via PIX', href: '#' },
];

function useCountdown(expiresAt: string) {
    const [secondsLeft, setSecondsLeft] = useState(() => {
        const diff = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);
        return Math.max(0, diff);
    });

    useEffect(() => {
        if (secondsLeft <= 0) return;
        const timer = setInterval(() => {
            setSecondsLeft((s) => Math.max(0, s - 1));
        }, 1000);
        return () => clearInterval(timer);
    }, [secondsLeft]);

    const days = Math.floor(secondsLeft / 86400);
    const hours = Math.floor((secondsLeft % 86400) / 3600);
    const minutes = Math.floor((secondsLeft % 3600) / 60);
    const seconds = secondsLeft % 60;

    return { secondsLeft, days, hours, minutes, seconds };
}

export default function BillingPayment({ pixPayment }: PaymentPageProps) {
    const [copied, setCopied] = useState(false);
    const [status, setStatus] = useState<'pending' | 'paid' | 'expired' | 'failed'>('pending');
    const { secondsLeft, days, hours, minutes, seconds } = useCountdown(pixPayment.expires_at);

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const response = await fetch(billingRoute.paymentStatus.url(pixPayment.id));
                const data = await response.json();
                setStatus(data.status);
                if (data.status === 'paid') {
                    clearInterval(interval);
                    router.visit(billingRoute.success.url());
                }
            } catch {
                // ignore network errors
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [pixPayment.id]);

    function handleCopy() {
        navigator.clipboard.writeText(pixPayment.qr_code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    const isExpired = secondsLeft === 0 || status === 'expired';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pagamento via PIX" />
            <div className="flex flex-1 flex-col items-center justify-center gap-6 p-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Pague via PIX</h1>
                    <p className="mt-1 text-muted-foreground">
                        Escaneie o QR Code ou copie o código PIX abaixo
                    </p>
                </div>

                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between text-base">
                            <span>{pixPayment.plan_name}</span>
                            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                {formatCurrency(pixPayment.amount_in_cents)}
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-4">
                        {isExpired ? (
                            <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
                                <Clock className="size-12 opacity-50" />
                                <p className="font-medium">QR Code expirado</p>
                                <p className="text-sm">Gere um novo pagamento para continuar.</p>
                                <Button variant="outline" className="mt-2" onClick={() => router.visit(billingRoute.index.url())}>
                                    Voltar para planos
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="rounded-xl border bg-white p-4">
                                    <QRCodeSVG value={pixPayment.qr_code} size={200} />
                                </div>

                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="size-4" />
                                    {days > 0 ? (
                                        <span>Expira em {days}d {hours}h {minutes}m</span>
                                    ) : (
                                        <span>
                                            Expira em {String(hours).padStart(2, '0')}:
                                            {String(minutes).padStart(2, '0')}:
                                            {String(seconds).padStart(2, '0')}
                                        </span>
                                    )}
                                </div>

                                <div className="w-full">
                                    <p className="mb-1 text-xs text-muted-foreground">Código PIX copia e cola:</p>
                                    <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
                                        <p className="flex-1 truncate font-mono text-xs">{pixPayment.qr_code}</p>
                                        <Button size="sm" variant="outline" onClick={handleCopy} className="shrink-0">
                                            {copied ? (
                                                <CheckCircle2 className="size-4 text-green-500" />
                                            ) : (
                                                <Copy className="size-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                <p className="text-center text-xs text-muted-foreground">
                                    Verificando pagamento automaticamente a cada 3 segundos...
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
