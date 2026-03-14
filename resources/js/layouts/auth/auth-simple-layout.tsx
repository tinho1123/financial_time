import { Link } from '@inertiajs/react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-screen bg-slate-950 text-white">
            {/* Left panel — branding */}
            <div className="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex lg:w-1/2">
                {/* Background glow */}
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/20 blur-[120px]" />
                    <div className="absolute right-10 bottom-10 h-[300px] w-[300px] rounded-full bg-violet-500/15 blur-[80px]" />
                </div>

                {/* Logo */}
                <Link
                    href={home()}
                    className="relative z-10 flex items-center gap-2"
                >
                    <span className="text-2xl">⏱️</span>
                    <span className="text-xl font-bold tracking-tight">
                        Financial<span className="text-emerald-400">Time</span>
                    </span>
                </Link>

                {/* Quote */}
                <div className="relative z-10">
                    <blockquote className="mb-8 space-y-4">
                        <p className="text-3xl leading-tight font-bold">
                            "Quem não controla o dinheiro,{' '}
                            <span className="text-emerald-400">
                                é controlado por ele.
                            </span>
                            "
                        </p>
                        <p className="text-slate-400">
                            Registre cada transação e descubra onde seu dinheiro
                            realmente vai.
                        </p>
                    </blockquote>

                    <div className="flex gap-8">
                        <div>
                            <div className="text-2xl font-extrabold text-emerald-400">
                                100%
                            </div>
                            <div className="text-sm text-slate-400">
                                Controle nas suas mãos
                            </div>
                        </div>
                        <div>
                            <div className="text-2xl font-extrabold text-emerald-400">
                                Grátis
                            </div>
                            <div className="text-sm text-slate-400">
                                Para começar agora
                            </div>
                        </div>
                        <div>
                            <div className="text-2xl font-extrabold text-emerald-400">
                                ∞
                            </div>
                            <div className="text-sm text-slate-400">
                                Transações registradas
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right panel — form */}
            <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
                {/* Mobile logo */}
                <Link
                    href={home()}
                    className="mb-8 flex items-center gap-2 lg:hidden"
                >
                    <span className="text-2xl">⏱️</span>
                    <span className="text-xl font-bold tracking-tight">
                        Financial<span className="text-emerald-400">Time</span>
                    </span>
                </Link>

                <div className="w-full max-w-sm">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold">{title}</h1>
                        <p className="mt-1 text-sm text-slate-400">
                            {description}
                        </p>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}
