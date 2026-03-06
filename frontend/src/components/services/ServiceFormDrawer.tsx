import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useServicesStore } from '@/stores/useServicesStore';
import { SERVICE_CATEGORY_LABELS, SERVICE_CATEGORY } from '@/types/service.types';
import * as Sheet from '@radix-ui/react-dialog';

const serviceSchema = z.object({
    name: z.string().min(1, 'Nombre es requerido'),
    description: z.string().optional(),
    category: z.enum([SERVICE_CATEGORY.DIAGNOSTIC, SERVICE_CATEGORY.TREATMENT, SERVICE_CATEGORY.FOLLOWUP, SERVICE_CATEGORY.OTHER]),
    basePrice: z.number().positive('Precio debe ser mayor a 0').optional(),
    duration: z.number().int().positive('Duración debe ser mayor a 0'),
    isActive: z.boolean(),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

interface ServiceFormDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    serviceId?: string;
    onSuccess?: () => void;
}

const ServiceFormDrawer = ({ isOpen, onClose, serviceId, onSuccess }: ServiceFormDrawerProps) => {
    const { selectedService, isUpdating, fetchServiceById, updateService } = useServicesStore();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<ServiceFormData>({
        resolver: zodResolver(serviceSchema),
    });

    useEffect(() => {
        if (serviceId && isOpen) {
            fetchServiceById(serviceId);
        }
    }, [serviceId, isOpen, fetchServiceById]);

    useEffect(() => {
        if (selectedService) {
            reset({
                name: selectedService.name,
                description: selectedService.description || '',
                category: selectedService.category,
                basePrice: selectedService.basePrice ?? undefined,
                duration: selectedService.duration,
                isActive: selectedService.isActive,
            });
        }
    }, [selectedService, reset]);

    const onSubmit = async (data: ServiceFormData) => {
        if (!serviceId) return;

        try {
            await updateService(serviceId, data);
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Error updating service:', error);
        }
    };

    return (
        <Sheet.Root open={isOpen} onOpenChange={onClose}>
            <Sheet.Portal>
                <Sheet.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in" />
                <Sheet.Content className="fixed right-0 top-0 h-full w-full sm:w-[500px] bg-[rgb(var(--bg-primary))] shadow-2xl z-50 flex flex-col animate-slide-in-right">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-[rgb(var(--border-primary))]">
                        <div>
                            <Sheet.Title className="text-2xl font-bold text-[rgb(var(--text-primary))]">
                                Editar Servicio
                            </Sheet.Title>
                            <Sheet.Description className="text-sm text-[rgb(var(--text-secondary))] mt-1">
                                Actualiza la información del servicio
                            </Sheet.Description>
                        </div>
                        <Sheet.Close className="text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] transition-colors">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </Sheet.Close>
                    </div>

                    {/* Form */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {!selectedService ? (
                            <div className="flex justify-center items-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                                        Nombre del Servicio <span className="text-error">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        {...register('name')}
                                        className="w-full px-4 py-2.5 rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-error">{errors.name.message}</p>
                                    )}
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                                        Descripción
                                    </label>
                                    <textarea
                                        {...register('description')}
                                        rows={3}
                                        className="w-full px-4 py-2.5 rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                                        Categoría <span className="text-error">*</span>
                                    </label>
                                    <select
                                        {...register('category')}
                                        className="w-full px-4 py-2.5 rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        {Object.entries(SERVICE_CATEGORY_LABELS).map(([key, label]) => (
                                            <option key={key} value={key}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.category && (
                                        <p className="mt-1 text-sm text-error">{errors.category.message}</p>
                                    )}
                                </div>

                                {/* Duration */}
                                <div>
                                    <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                                        Duración (minutos) <span className="text-error">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        {...register('duration', { valueAsNumber: true })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                    {errors.duration && (
                                        <p className="mt-1 text-sm text-error">{errors.duration.message}</p>
                                    )}
                                </div>

                                {/* Price */}
                                <div>
                                    <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                                        Precio Base (S/) <span className="text-xs text-[rgb(var(--text-secondary))]">(Opcional)</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...register('basePrice', { valueAsNumber: true })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                    {errors.basePrice && (
                                        <p className="mt-1 text-sm text-error">{errors.basePrice.message}</p>
                                    )}
                                </div>

                                {/* Active Status */}
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        {...register('isActive')}
                                        id="isActive"
                                        className="w-4 h-4 text-primary bg-[rgb(var(--bg-card))] border-[rgb(var(--border-primary))] rounded focus:ring-primary focus:ring-2"
                                    />
                                    <label htmlFor="isActive" className="ml-2 text-sm text-[rgb(var(--text-primary))]">
                                        Servicio activo
                                    </label>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-[rgb(var(--border-primary))] flex gap-3">
                        <button
                            type="button"
                            onClick={handleSubmit(onSubmit)}
                            disabled={isUpdating || !selectedService}
                            style={{
                                background: 'linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-accent)) 100%)'
                            }}
                            className="flex-1 px-6 py-2.5 text-white rounded-lg hover:opacity-90 transition-opacity duration-200 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isUpdating && (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            )}
                            Actualizar Servicio
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 border border-[rgb(var(--border-primary))] text-[rgb(var(--text-primary))] rounded-lg hover:bg-[rgb(var(--bg-secondary))] transition-colors font-medium"
                        >
                            Cancelar
                        </button>
                    </div>
                </Sheet.Content>
            </Sheet.Portal>
        </Sheet.Root>
    );
};

export default ServiceFormDrawer;
