import { useForm } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { CategoryForm } from '@/components/category-form';
import { PlanLimitBanner } from '@/components/plan-limit-banner';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import categories from '@/routes/categories';
import type { BreadcrumbItem, Category } from '@/types';

interface CategoriesPageProps {
    incomeCategories: Category[];
    expenseCategories: Category[];
    canAddMore: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Categorias', href: categories.index.url() },
];

function CategoryCard({
    category,
    onEdit,
}: {
    category: Category;
    onEdit: (c: Category) => void;
}) {
    const { delete: destroy, processing } = useForm();

    function handleDelete() {
        if (!confirm(`Excluir categoria "${category.name}"?`)) {
            return;
        }
        destroy(categories.destroy.url(category.id));
    }

    return (
        <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
                <span
                    className="size-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                />
                <span className="text-sm font-medium">{category.name}</span>
            </div>
            <div className="flex gap-1">
                <Button
                    size="icon"
                    variant="ghost"
                    className="size-8"
                    onClick={() => onEdit(category)}
                >
                    <Pencil className="size-3.5" />
                </Button>
                <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 text-destructive hover:text-destructive"
                    onClick={handleDelete}
                    disabled={processing}
                >
                    <Trash2 className="size-3.5" />
                </Button>
            </div>
        </div>
    );
}

export default function CategoriesIndex({
    incomeCategories,
    expenseCategories,
    canAddMore,
}: CategoriesPageProps) {
    const [createOpen, setCreateOpen] = useState(false);
    const [createType, setCreateType] = useState<'income' | 'expense'>(
        'income',
    );
    const [editCategory, setEditCategory] = useState<Category | null>(null);

    function openCreate(type: 'income' | 'expense') {
        setCreateType(type);
        setCreateOpen(true);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categorias" />
            <div className="flex flex-col gap-6 p-4">
                {!canAddMore && (
                    <PlanLimitBanner message="Você atingiu o limite de 5 categorias do plano gratuito." />
                )}

                <div className="grid gap-6 md:grid-cols-2">
                    <section className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold text-green-700 dark:text-green-400">
                                Receitas ({incomeCategories.length})
                            </h2>
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={!canAddMore}
                                onClick={() => openCreate('income')}
                            >
                                <Plus className="size-4" />
                                Adicionar
                            </Button>
                        </div>
                        {incomeCategories.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Nenhuma categoria de receita.
                            </p>
                        ) : (
                            incomeCategories.map((c) => (
                                <CategoryCard
                                    key={c.id}
                                    category={c}
                                    onEdit={setEditCategory}
                                />
                            ))
                        )}
                    </section>

                    <section className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold text-red-700 dark:text-red-400">
                                Despesas ({expenseCategories.length})
                            </h2>
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={!canAddMore}
                                onClick={() => openCreate('expense')}
                            >
                                <Plus className="size-4" />
                                Adicionar
                            </Button>
                        </div>
                        {expenseCategories.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Nenhuma categoria de despesa.
                            </p>
                        ) : (
                            expenseCategories.map((c) => (
                                <CategoryCard
                                    key={c.id}
                                    category={c}
                                    onEdit={setEditCategory}
                                />
                            ))
                        )}
                    </section>
                </div>
            </div>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nova categoria</DialogTitle>
                    </DialogHeader>
                    <CategoryForm
                        defaultType={createType}
                        onSuccess={() => setCreateOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            <Dialog
                open={Boolean(editCategory)}
                onOpenChange={(open) => !open && setEditCategory(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar categoria</DialogTitle>
                    </DialogHeader>
                    {editCategory && (
                        <CategoryForm
                            category={editCategory}
                            onSuccess={() => setEditCategory(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
