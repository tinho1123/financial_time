import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import categories from '@/routes/categories';
import type { Category } from '@/types';

interface CategoryFormProps {
    category?: Category;
    defaultType?: 'income' | 'expense';
    onSuccess?: () => void;
}

const PRESET_COLORS = [
    '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
    '#f97316', '#eab308', '#22c55e', '#14b8a6',
    '#3b82f6', '#64748b',
];

export function CategoryForm({ category, defaultType = 'income', onSuccess }: CategoryFormProps) {
    const isEditing = Boolean(category);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: category?.name ?? '',
        type: category?.type ?? defaultType,
        color: category?.color ?? '#6366f1',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (isEditing && category) {
            put(categories.update.url(category.id), {
                onSuccess: () => {
                    onSuccess?.();
                },
            });
        } else {
            post(categories.store.url(), {
                onSuccess: () => {
                    reset('name');
                    onSuccess?.();
                },
            });
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
                <Label htmlFor="cat-name">Nome</Label>
                <Input
                    id="cat-name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="Ex: Alimentação"
                    aria-invalid={Boolean(errors.name)}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            {!isEditing && (
                <div className="space-y-1.5">
                    <Label>Tipo</Label>
                    <div className="flex gap-2">
                        {(['income', 'expense'] as const).map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setData('type', t)}
                                className={`flex-1 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                                    data.type === t
                                        ? t === 'income'
                                            ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                            : 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                        : 'border-input hover:bg-accent'
                                }`}
                            >
                                {t === 'income' ? 'Receita' : 'Despesa'}
                            </button>
                        ))}
                    </div>
                    {errors.type && <p className="text-xs text-destructive">{errors.type}</p>}
                </div>
            )}

            <div className="space-y-1.5">
                <Label>Cor</Label>
                <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((color) => (
                        <button
                            key={color}
                            type="button"
                            onClick={() => setData('color', color)}
                            className={`size-7 rounded-full transition-transform hover:scale-110 ${data.color === color ? 'ring-2 ring-offset-2 ring-ring' : ''}`}
                            style={{ backgroundColor: color }}
                            title={color}
                        />
                    ))}
                    <input
                        type="color"
                        value={data.color}
                        onChange={(e) => setData('color', e.target.value)}
                        className="size-7 cursor-pointer rounded-full border-0 bg-transparent p-0"
                        title="Cor personalizada"
                    />
                </div>
                {errors.color && <p className="text-xs text-destructive">{errors.color}</p>}
            </div>

            <Button type="submit" disabled={processing} className="w-full">
                {isEditing ? 'Salvar' : 'Criar categoria'}
            </Button>
        </form>
    );
}
