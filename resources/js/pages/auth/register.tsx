import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { store } from '@/routes/register';

export default function Register() {
    return (
        <AuthLayout
            title="Criar sua conta"
            description="Preencha os dados abaixo para começar gratuitamente"
        >
            <Head title="Cadastro — Financial Time" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="name"
                                    className="text-slate-300"
                                >
                                    Nome completo
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Seu nome"
                                    className="border-white/10 bg-slate-800 text-white placeholder:text-slate-500 focus:border-emerald-500"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="email"
                                    className="text-slate-300"
                                >
                                    E-mail
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="seu@email.com"
                                    className="border-white/10 bg-slate-800 text-white placeholder:text-slate-500 focus:border-emerald-500"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="password"
                                    className="text-slate-300"
                                >
                                    Senha
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Mínimo 8 caracteres"
                                    className="border-white/10 bg-slate-800 text-white placeholder:text-slate-500 focus:border-emerald-500"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="password_confirmation"
                                    className="text-slate-300"
                                >
                                    Confirmar senha
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Repita a senha"
                                    className="border-white/10 bg-slate-800 text-white placeholder:text-slate-500 focus:border-emerald-500"
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="mt-1 w-full rounded-full bg-emerald-500 py-5 font-bold text-white hover:bg-emerald-400"
                                tabIndex={5}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                Criar conta grátis
                            </Button>
                        </div>

                        <div className="text-center text-sm text-slate-500">
                            Já tem uma conta?{' '}
                            <TextLink
                                href={login()}
                                tabIndex={6}
                                className="text-emerald-400 hover:text-emerald-300"
                            >
                                Entrar
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
