import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import goals from '@/routes/goals';
import type { Goal } from '@/types';

interface GoalFormProps {
    goal?: Goal;
    onSuccess?: () => void;
}

export function GoalForm({ goal, onSuccess }: GoalFormProps) {
    const isEditing = Boolean(goal);

    const { data, setData, post, put, processing, errors } = useForm({
        name: goal?.name ?? '',
        target_in_cents: goal ? (goal.target_in_cents / 100).toFixed(2) : '',
        saved_in_cents: goal ? (goal.saved_in_cents / 100).toFixed(2) : '',
        deadline: goal?.deadline ?? '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (isEditing && goal) {
            put(goals.update.url(goal.id), { onSuccess: () => onSuccess?.() });
        } else {
            post(goals.store.url(), { onSuccess: () => onSuccess?.() });
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
                <Label htmlFor="goal-name">Objetivo</Label>
                <Input
                    id="goal-name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="Ex.: Reserva de emergência"
                    aria-invalid={Boolean(errors.name)}
                    autoFocus
                />
                {errors.name && (
                    <p className="text-xs text-destructive">{errors.name}</p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label htmlFor="goal-target">Meta (R$)</Label>
                    <Input
                        id="goal-target"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={data.target_in_cents}
                        onChange={(e) =>
                            setData('target_in_cents', e.target.value)
                        }
                        placeholder="0,00"
                        aria-invalid={Boolean(errors.target_in_cents)}
                    />
                    {errors.target_in_cents && (
                        <p className="text-xs text-destructive">
                            {errors.target_in_cents}
                        </p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="goal-saved">Já guardado (R$)</Label>
                    <Input
                        id="goal-saved"
                        type="number"
                        min="0"
                        step="0.01"
                        value={data.saved_in_cents}
                        onChange={(e) =>
                            setData('saved_in_cents', e.target.value)
                        }
                        placeholder="0,00"
                        aria-invalid={Boolean(errors.saved_in_cents)}
                    />
                    {errors.saved_in_cents && (
                        <p className="text-xs text-destructive">
                            {errors.saved_in_cents}
                        </p>
                    )}
                </div>
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="goal-deadline">Prazo (opcional)</Label>
                <Input
                    id="goal-deadline"
                    type="date"
                    value={data.deadline}
                    onChange={(e) => setData('deadline', e.target.value)}
                    aria-invalid={Boolean(errors.deadline)}
                />
                {errors.deadline && (
                    <p className="text-xs text-destructive">
                        {errors.deadline}
                    </p>
                )}
            </div>

            <Button type="submit" disabled={processing} className="w-full">
                {isEditing ? 'Salvar alterações' : 'Criar meta'}
            </Button>
        </form>
    );
}
