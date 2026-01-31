import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePatientsStore } from '@/stores/usePatientsStore';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/Button';

const quickPatientSchema = z.object({
    firstName: z.string().min(1, 'El nombre es requerido'),
    lastName: z.string().min(1, 'El apellido es requerido'),
    phone: z.string()
        .min(9, 'El teléfono debe tener 9 dígitos')
        .max(9, 'El teléfono debe tener 9 dígitos')
        .regex(/^9\d{8}$/, 'El teléfono debe comenzar con 9'),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
});

type QuickPatientFormData = z.infer<typeof quickPatientSchema>;

interface QuickPatientFormProps {
    onSuccess: (patientId: string) => void;
    onCancel: () => void;
}

const QuickPatientForm = ({ onSuccess, onCancel }: QuickPatientFormProps) => {
    const { createPatient, isCreating } = usePatientsStore();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<QuickPatientFormData>({
        resolver: zodResolver(quickPatientSchema),
        mode: 'onBlur',
    });

    const onSubmit = async (data: QuickPatientFormData) => {
        try {
            const patient = await createPatient({
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                // Only include email if it's not empty
                ...(data.email && { email: data.email }),
            });

            onSuccess(patient.id);
        } catch (error) {
            console.error('Error creating patient:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="quick-firstName">
                        Nombre <span className="text-error">*</span>
                    </Label>
                    <Input
                        id="quick-firstName"
                        type="text"
                        maxLength={50}
                        {...register('firstName')}
                        onInput={(e) => {
                            const target = e.target as HTMLInputElement;
                            target.value = target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
                        }}
                        className="h-9"
                    />
                    {errors.firstName && (
                        <p className="text-sm text-error">{errors.firstName.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="quick-lastName">
                        Apellido <span className="text-error">*</span>
                    </Label>
                    <Input
                        id="quick-lastName"
                        type="text"
                        maxLength={50}
                        {...register('lastName')}
                        onInput={(e) => {
                            const target = e.target as HTMLInputElement;
                            target.value = target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
                        }}
                        className="h-9"
                    />
                    {errors.lastName && (
                        <p className="text-sm text-error">{errors.lastName.message}</p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="quick-phone">
                    Teléfono <span className="text-error">*</span>
                </Label>
                <Input
                    id="quick-phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={9}
                    placeholder="987654321"
                    {...register('phone')}
                    onInput={(e) => {
                        const target = e.target as HTMLInputElement;
                        let value = target.value.replace(/\D/g, '');
                        if (value.length > 0 && value[0] !== '9') {
                            value = '9' + value.slice(0, 8);
                        }
                        target.value = value;
                    }}
                    className="h-9"
                />
                {errors.phone && (
                    <p className="text-sm text-error">{errors.phone.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="quick-email">Email (opcional)</Label>
                <Input
                    id="quick-email"
                    type="email"
                    {...register('email')}
                    className="h-9"
                />
                {errors.email && (
                    <p className="text-sm text-error">{errors.email.message}</p>
                )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isCreating}
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    disabled={isCreating}
                    style={{
                        background: 'linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-accent)) 100%)'
                    }}
                    className="hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    {isCreating && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    )}
                    Crear Paciente
                </Button>
            </div>
        </form>
    );
};

export default QuickPatientForm;
