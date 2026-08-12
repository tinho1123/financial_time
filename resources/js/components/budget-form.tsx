import { Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import budgets from '@/routes/budgets';
import categoriesRoute from '@/routes/categories';
import type { Budget, Category } from '@/types';

interface BudgetFormProps {
    budget?: Budget;
    availableCategories: Category[];
    onSuccess?: () => void;
}

export function BudgetForm({
    budget,
    availableCategories,
    onSuccess,
}: BudgetFormProps) {
    const isEditing = Boolean(budget);

    const { data, setData, post, put, processing, errors } = useForm({
        category_id: budget?.category.id ?? availableCategories[0]?.id ?? '',
        amount_in_cents: budget
            ? (budget.amount_in_cents / 100).toFixed(2)
            : '',
    });

    if (!isEditing && availableCategories.length === 0) {
        return (
            <div className="space-y-4 py-6 text-center">
                <p className="text-sm text-muted-foreground">
                    Todas as suas categorias de despesa já têm um orçamento, ou
                    você ainda não criou nenhuma.
                </p>
                <Button asChild>
                    <Link href={categoriesRoute.index.url()}>
                        Gerenciar categorias
                    </Link>
                </Button>
            </div>
        );
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (isEditing && budget) {
            put(budgets.update.url(budget.id), {
                onSuccess: () => onSuccess?.(),
            });
        } else {
            post(budgets.store.url(), { onSuccess: () => onSuccess?.() });
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
                <Label htmlFor="budget-category">Categoria</Label>
                {isEditing ? (
                    <div className="flex h-9 items-center gap-2 rounded-md border border-input px-3 text-sm">
                        <span
                            className="size-2.5 rounded-full"
                            style={{ backgroundColor: budget?.category.color }}
                        />
                        {budget?.category.name}
                    </div>
                ) : (
                    <select
                        id="budget-category"
                        value={data.category_id}
                        onChange={(e) =>
                            setData('category_id', Number(e.target.value))
                        }
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        aria-invalid={Boolean(errors.category_id)}
                    >
                        {availableCategories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                )}
                {errors.category_id && (
                    <p className="text-xs text-destructive">
                        {errors.category_id}
                    </p>
                )}
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="budget-amount">Limite mensal</Label>
                <Input
                    id="budget-amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={data.amount_in_cents}
                    onChange={(e) => setData('amount_in_cents', e.target.value)}
                    placeholder="0,00"
                    aria-invalid={Boolean(errors.amount_in_cents)}
                />
                {errors.amount_in_cents && (
                    <p className="text-xs text-destructive">
                        {errors.amount_in_cents}
                    </p>
                )}
            </div>

            <Button type="submit" disabled={processing} className="w-full">
                {isEditing ? 'Salvar alterações' : 'Criar orçamento'}
            </Button>
        </form>
    );
}
