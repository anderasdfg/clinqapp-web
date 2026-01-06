import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface BasicDataStepProps {
    form: UseFormReturn<any>;
    onSubmit: (data: any) => void;
}

export const BasicDataStep = ({ form, onSubmit }: BasicDataStepProps) => {
    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-4 animate-scale-in">
                    <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-[rgb(var(--text-primary))] mb-2">
                    Datos del Consultorio
                </h2>
                <p className="text-sm text-[rgb(var(--text-secondary))]">
                    Información básica de tu centro médico
                </p>
            </div>

            <Input
                label="Nombre del Consultorio"
                placeholder="Consultorio Podológico San Isidro"
                error={form.formState.errors.name?.message as string}
                {...form.register('name')}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label="RUC"
                    placeholder="20123456789"
                    maxLength={11}
                    error={form.formState.errors.ruc?.message as string}
                    {...form.register('ruc')}
                />
                <Input
                    label="Teléfono"
                    placeholder="987654321"
                    maxLength={9}
                    error={form.formState.errors.phone?.message as string}
                    {...form.register('phone')}
                />
            </div>
            <Input
                label="Dirección"
                placeholder="Av. Javier Prado 123, San Isidro"
                error={form.formState.errors.address?.message as string}
                {...form.register('address')}
            />
            <Input
                label="Email de Contacto"
                type="email"
                placeholder="contacto@consultorio.com"
                error={form.formState.errors.email?.message as string}
                {...form.register('email')}
            />
            <Button type="submit" className="w-full mt-6">
                Continuar
            </Button>
        </form>
    );
};
