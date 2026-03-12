import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { login, register } from '@/routes';
import type { Plan } from '@/types/finance';

interface WelcomeProps {
    canRegister?: boolean;
    plans: Plan[];
}

const features = [
    {
        icon: '📊',
        title: 'Visão em tempo real',
        description: 'Acompanhe receitas e despesas no momento em que acontecem. Sem surpresas no fim do mês.',
    },
    {
        icon: '🏷️',
        title: 'Categorias inteligentes',
        description: 'Organize seus gastos por categorias personalizadas e identifique para onde vai cada centavo.',
    },
    {
        icon: '🏦',
        title: 'Múltiplas contas',
        description: 'Gerencie contas correntes, poupança, carteira e investimentos em um só lugar.',
    },
    {
        icon: '📈',
        title: 'Relatórios visuais',
        description: 'Gráficos mensais de receitas x despesas para entender sua evolução financeira.',
    },
];

const tips = [
    { emoji: '💡', text: 'Anote cada gasto, por menor que seja. Pequenos valores se acumulam.' },
    { emoji: '🎯', text: 'Defina metas mensais por categoria e acompanhe seu progresso.' },
    { emoji: '🚫', text: 'Identifique assinaturas e gastos fixos desnecessários para cortar.' },
    { emoji: '💰', text: 'Reserve pelo menos 10% da renda antes de gastar — pague a si mesmo primeiro.' },
];

export default function Welcome({ canRegister = true }: WelcomeProps) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Financial Time — Controle suas finanças" />

            <div className="min-h-screen bg-slate-950 text-white">
                {/* Navbar */}
                <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">⏱️</span>
                            <span className="text-xl font-bold tracking-tight">
                                Financial<span className="text-emerald-400">Time</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-400"
                                >
                                    Ir para o app →
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="text-sm font-medium text-slate-300 transition hover:text-white"
                                    >
                                        Entrar
                                    </Link>
                                    {canRegister && (
                                        <Link
                                            href={register()}
                                            className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-400"
                                        >
                                            Criar conta grátis
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </nav>

                {/* Hero */}
                <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-20">
                    <div className="pointer-events-none absolute inset-0">
                        <div className="absolute top-1/3 left-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/20 blur-[120px]" />
                        <div className="absolute top-2/3 right-10 h-[300px] w-[400px] rounded-full bg-violet-500/15 blur-[100px]" />
                    </div>

                    <div className="relative z-10 mx-auto max-w-4xl text-center">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm text-emerald-400">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                            Seu dinheiro, sob controle
                        </div>

                        <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight md:text-7xl">
                            Pare de{' '}
                            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                                perder dinheiro
                            </span>{' '}
                            sem saber por quê
                        </h1>

                        <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-400 md:text-xl">
                            O Financial Time é um sistema de gestão financeira pessoal que te ajuda a registrar,
                            categorizar e entender seus gastos — para você tomar decisões com consciência.
                        </p>

                        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                            {canRegister && !auth.user && (
                                <Link
                                    href={register()}
                                    className="rounded-full bg-emerald-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 hover:shadow-emerald-400/40"
                                >
                                    Começar agora — é grátis
                                </Link>
                            )}
                            {auth.user && (
                                <Link
                                    href={dashboard()}
                                    className="rounded-full bg-emerald-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400"
                                >
                                    Acessar meu painel →
                                </Link>
                            )}
                            {/* <a
                                href="#planos"
                                className="rounded-full border border-white/20 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10"
                            >
                                Ver planos
                            </a> */}
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="px-6 py-24">
                    <div className="mx-auto max-w-6xl">
                        <div className="mb-16 text-center">
                            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                                Tudo que você precisa para{' '}
                                <span className="text-emerald-400">organizar sua vida financeira</span>
                            </h2>
                            <p className="text-slate-400">Ferramentas simples, resultados poderosos.</p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {features.map((feature) => (
                                <div
                                    key={feature.title}
                                    className="rounded-2xl border border-white/10 bg-slate-900 p-6 transition hover:border-emerald-500/40 hover:bg-slate-800/80"
                                >
                                    <div className="mb-4 text-4xl">{feature.icon}</div>
                                    <h3 className="mb-2 font-semibold text-white">{feature.title}</h3>
                                    <p className="text-sm leading-relaxed text-slate-400">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Pricing — temporariamente desabilitado
                {plans.length > 0 && (
                    <section id="planos" className="px-6 py-24">
                        <div className="mx-auto max-w-6xl">
                            <div className="mb-16 text-center">
                                <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                                    Planos para{' '}
                                    <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                                        todos os momentos
                                    </span>
                                </h2>
                                <p className="text-slate-400">
                                    Comece grátis e evolua conforme sua necessidade.
                                </p>
                            </div>

                            <div className="grid gap-6 md:grid-cols-3 items-start">
                                {freePlan && (
                                    <PlanCard plan={freePlan} canRegister={canRegister} />
                                )}
                                {monthlyPlan && (
                                    <PlanCard plan={monthlyPlan} highlight canRegister={canRegister} />
                                )}
                                {annualPlan && (
                                    <PlanCard plan={annualPlan} canRegister={canRegister} />
                                )}
                            </div>

                            <p className="mt-8 text-center text-sm text-slate-500">
                                Todos os planos incluem cancelamento a qualquer momento. Sem fidelidade.
                            </p>
                        </div>
                    </section>
                )}
                */}

                {/* Tips */}
                <section className="px-6 py-24">
                    <div className="mx-auto max-w-4xl">
                        <div className="mb-12 text-center">
                            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                                Dicas de quem entende de{' '}
                                <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
                                    controle financeiro
                                </span>
                            </h2>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            {tips.map((tip) => (
                                <div
                                    key={tip.text}
                                    className="flex items-start gap-4 rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5"
                                >
                                    <span className="mt-0.5 text-2xl">{tip.emoji}</span>
                                    <p className="text-sm leading-relaxed text-slate-300">{tip.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="px-6 py-24">
                    <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-cyan-500 p-12 text-center shadow-2xl shadow-emerald-500/20">
                        <h2 className="mb-4 text-3xl font-extrabold text-slate-900 md:text-4xl">
                            Sua saúde financeira começa hoje
                        </h2>
                        <p className="mb-8 text-slate-800">
                            Registre sua primeira transação em menos de 1 minuto.
                        </p>
                        {!auth.user && canRegister && (
                            <Link
                                href={register()}
                                className="inline-block rounded-full bg-slate-900 px-8 py-4 text-base font-bold text-white transition hover:bg-slate-800"
                            >
                                Criar conta gratuita →
                            </Link>
                        )}
                        {auth.user && (
                            <Link
                                href={dashboard()}
                                className="inline-block rounded-full bg-slate-900 px-8 py-4 text-base font-bold text-white transition hover:bg-slate-800"
                            >
                                Ir para o painel →
                            </Link>
                        )}
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-white/5 px-6 py-10 text-center">
                    <div className="mb-2 flex items-center justify-center gap-2">
                        <span className="text-xl">⏱️</span>
                        <span className="font-bold">
                            Financial<span className="text-emerald-400">Time</span>
                        </span>
                    </div>
                    <p className="text-sm text-slate-500">Feito para quem leva o futuro a sério.</p>
                </footer>
            </div>
        </>
    );
}
