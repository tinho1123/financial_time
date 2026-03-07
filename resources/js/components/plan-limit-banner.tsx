import { AlertTriangle } from 'lucide-react';
import { Link } from '@inertiajs/react';
import billing from '@/routes/billing';

interface PlanLimitBannerProps {
    message: string;
}

export function PlanLimitBanner({ message }: PlanLimitBannerProps) {
    return (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-300">
            <AlertTriangle className="size-4 shrink-0" />
            <span>{message}</span>
            <Link
                href={billing.index.url()}
                className="ml-auto shrink-0 font-medium underline-offset-2 hover:underline"
            >
                Ver planos
            </Link>
        </div>
    );
}
