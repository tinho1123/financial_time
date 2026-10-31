import { Transition } from '@headlessui/react';
import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';
import CoupleSplitController from '@/actions/App/Http/Controllers/Settings/CoupleSplitController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/couple-split';
import type { BreadcrumbItem } from '@/types';

interface CoupleSplitProps {
    partnerName: string | null;
    ownIncomeInCents: number | null;
    partnerIncomeInCents: number | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Rateio do casal',
        href: edit(),
    },
];

const toDecimal = (cents: number | null) =>
    cents === null ? '' : (cents / 100).toFixed(2);

export default function CoupleSplit({
    partnerName,
    ownIncomeInCents,
    partnerIncomeInCents,
}: CoupleSplitProps) {
    const [ownIncome, setOwnIncome] = useState(toDecimal(ownIncomeInCents));
    const [partnerIncome, setPartnerIncome] = useState(
        toDecimal(partnerIncomeInCents),
    );

    const totalIncome = Number(ownIncome) + Number(partnerIncome);
    const ownShare = totalIncome > 0 ? Number(ownIncome) / totalIncome : null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Rateio do casal" />

            <h1 className="sr-only">Rateio do casal</h1>

            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Rateio do casal"
                        description="Informe as rendas líquidas mensais para dividir as despesas do mês de forma proporcional no dashboard."
                    />

                    <Form
                        {...CoupleSplitController.update.form()}
                        options={{ preserveScroll: true }}
                        className="space-y-6"
                    >
                        {({ errors, processing, recentlySuccessful }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="partner_name">
                                        Nome do parceiro(a)
                                    </Label>
                                    <Input
                                        id="partner_name"
                                        name="partner_name"
                                        defaultValue={partnerName ?? ''}
                                        placeholder="Ex.: Ana"
                                        className="mt-1 block w-full"
                                    />
                                    <InputError message={errors.partner_name} />
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="own_income_in_cents">
                                            Sua renda líquida (R$)
                                        </Label>
                                        <Input
                                            id="own_income_in_cents"
                                            name="own_income_in_cents"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={ownIncome}
                                            onChange={(e) =>
                                                setOwnIncome(e.target.value)
                                            }
                                            placeholder="0,00"
                                            className="mt-1 block w-full"
                                        />
                                        <InputError
                                            message={errors.own_income_in_cents}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="partner_income_in_cents">
                                            Renda do parceiro(a) (R$)
                                        </Label>
                                        <Input
                                            id="partner_income_in_cents"
                                            name="partner_income_in_cents"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={partnerIncome}
                                            onChange={(e) =>
                                                setPartnerIncome(e.target.value)
                                            }
                                            placeholder="0,00"
                                            className="mt-1 block w-full"
                                        />
                                        <InputError
                                            message={
                                                errors.partner_income_in_cents
                                            }
                                        />
                                    </div>
                                </div>

                                {ownShare !== null && (
                                    <p className="text-sm text-muted-foreground">
                                        Divisão:{' '}
                                        <span className="font-medium text-foreground">
                                            você{' '}
                                            {(ownShare * 100)
                                                .toFixed(1)
                                                .replace('.', ',')}
                                            %
                                        </span>{' '}
                                        ·{' '}
                                        <span className="font-medium text-foreground">
                                            parceiro(a){' '}
                                            {((1 - ownShare) * 100)
                                                .toFixed(1)
                                                .replace('.', ',')}
                                            %
                                        </span>
                                    </p>
                                )}

                                <p className="text-xs text-muted-foreground">
                                    Deixe todos os campos em branco para
                                    desativar o rateio.
                                </p>

                                <div className="flex items-center gap-4">
                                    <Button disabled={processing}>
                                        Salvar
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-neutral-600">
                                            Salvo
                                        </p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
