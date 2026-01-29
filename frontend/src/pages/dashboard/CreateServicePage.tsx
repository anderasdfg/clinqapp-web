import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useServicesStore } from '@/stores/useServicesStore';
import { ServiceCategory, SERVICE_CATEGORY_LABELS } from '@/types/service.types';

const serviceSchema = z.object({
    name: z.string().min(1, 'Nombre es requerido'),
    description: z.string().optional(),
    category: z.nativeEnum(ServiceCategory),
    basePrice: z.number().positive('Precio debe ser mayor a 0'),
    duration: z.number().int().positive('Duración debe ser mayor a 0'),
    isActive: z.boolean(),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

const CreateServicePage = () => {
    const navigate = useNavigate();
    const { createService, isCreating } = useServicesStore();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ServiceFormData>({
        resolver: zodResolver(serviceSchema),
        defaultValues: {
            category: ServiceCategory.OTHER,
            isActive: true,
            duration: 30,
        },
    });

    const onSubmit = async (data: ServiceFormData) => {
        try {
            await createService(data);
            navigate('/app/dashboard/services');
        } catch (error) {
            console.error('Error creating service:', error);
        }
    };

    return (
        <div className="animate-fade-in max-w-3xl">
            <div className="mb-6">
                <button
                    onClick={() => navigate('/app/dashboard/services')}
                    className="flex items-center gap-2 text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] mb-4"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Volver a Servicios
                </button>
                <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-2">
                    Nuevo Servicio
                </h1>
                <p className="text-[rgb(var(--text-secondary))]">
                    Crea un nuevo servicio para tu clínica
                </p>
            </div>

            <div className="card p-6">
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
                            placeholder="Ej: Consulta General"
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
                            placeholder="Descripción del servicio..."
                        />
                    </div>

                    {/* Category and Duration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                        <div>
                            <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                                Duración (minutos) <span className="text-error">*</span>
                            </label>
                            <input
                                type="number"
                                {...register('duration', { valueAsNumber: true })}
                                className="w-full px-4 py-2.5 rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="30"
                            />
                            {errors.duration && (
                                <p className="mt-1 text-sm text-error">{errors.duration.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Price */}
                    <div>
                        <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                            Precio Base (S/) <span className="text-error">*</span>
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            {...register('basePrice', { valueAsNumber: true })}
                            className="w-full px-4 py-2.5 rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="100.00"
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

                    {/* Actions */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={isCreating}
                            style={{
                                background: 'linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-accent)) 100%)'
                            }}
                            className="px-6 py-2.5 text-white rounded-lg hover:opacity-90 transition-opacity duration-200 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isCreating && (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            )}
                            Crear Servicio
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/app/dashboard/services')}
                            className="px-6 py-2.5 border border-[rgb(var(--border-primary))] text-[rgb(var(--text-primary))] rounded-lg hover:bg-[rgb(var(--bg-secondary))] transition-colors font-medium"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateServicePage;
