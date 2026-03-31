import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    return (
        <AuthLayout
            title="Entrar na sua conta"
            description="Acesse seu painel de controle financeiro"
        >
            <Head title="Entrar — Financial Time" />

            {status && (
                <div className="mb-4 rounded-lg bg-emerald-500/10 p-3 text-center text-sm font-medium text-emerald-400">
                    {status}
                </div>
            )}

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
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
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="seu@email.com"
                                    className="border-white/10 bg-slate-800 text-white placeholder:text-slate-500 focus:border-emerald-500"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label
                                        htmlFor="password"
                                        className="text-slate-300"
                                    >
                                        Senha
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-sm text-slate-400 hover:text-emerald-400"
                                            tabIndex={5}
                                        >
                                            Esqueceu a senha?
                                        </TextLink>
                                    )}
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Sua senha"
                                    className="border-white/10 bg-slate-800 text-white placeholder:text-slate-500 focus:border-emerald-500"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                />
                                <Label
                                    htmlFor="remember"
                                    className="text-slate-400"
                                >
                                    Lembrar de mim
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-1 w-full rounded-full bg-emerald-500 py-5 font-bold text-white hover:bg-emerald-400"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                Entrar
                            </Button>
                        </div>

                        {canRegister && (
                            <div className="text-center text-sm text-slate-500">
                                Não tem uma conta?{' '}
                                <TextLink
                                    href={register()}
                                    tabIndex={5}
                                    className="text-emerald-400 hover:text-emerald-300"
                                >
                                    Criar conta grátis
                                </TextLink>
                            </div>
                        )}
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
