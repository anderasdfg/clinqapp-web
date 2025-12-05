import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useStaffStore } from '@/stores/useStaffStore';
import { UserRole, USER_ROLE_LABELS } from '@/types/staff.types';

const staffSchema = z.object({
    firstName: z.string().min(1, 'Nombre es requerido'),
    lastName: z.string().min(1, 'Apellido es requerido'),
    email: z.string().email('Email inválido'),
    phone: z.string().optional(),
    specialty: z.string().optional(),
    licenseNumber: z.string().optional(),
    role: z.nativeEnum(UserRole),
});

type StaffFormData = z.infer<typeof staffSchema>;

const EditStaffPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { selectedStaff, isUpdating, fetchStaffById, updateStaff } = useStaffStore();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<StaffFormData>({
        resolver: zodResolver(staffSchema),
    });

    useEffect(() => {
        if (id) {
            fetchStaffById(id);
        }
    }, [id, fetchStaffById]);

    useEffect(() => {
        if (selectedStaff) {
            reset({
                firstName: selectedStaff.firstName,
                lastName: selectedStaff.lastName,
                email: selectedStaff.email,
                phone: selectedStaff.phone || '',
                specialty: selectedStaff.specialty || '',
                licenseNumber: selectedStaff.licenseNumber || '',
                role: selectedStaff.role,
            });
        }
    }, [selectedStaff, reset]);

    const onSubmit = async (data: StaffFormData) => {
        if (!id) return;

        try {
            await updateStaff(id, data);
            navigate('/dashboard/staff');
        } catch (error) {
            console.error('Error updating staff:', error);
        }
    };

    if (!selectedStaff) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in max-w-3xl">
            <div className="mb-6">
                <button
                    onClick={() => navigate('/dashboard/staff')}
                    className="flex items-center gap-2 text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] mb-4"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Volver a Personal
                </button>
                <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-2">
                    Editar Personal
                </h1>
                <p className="text-[rgb(var(--text-secondary))]">
                    Actualiza la información del profesional
                </p>
            </div>

            <div className="card p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Name Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                                Nombre <span className="text-error">*</span>
                            </label>
                            <input
                                type="text"
                                {...register('firstName')}
                                className="w-full px-4 py-2.5 rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            {errors.firstName && (
                                <p className="mt-1 text-sm text-error">{errors.firstName.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                                Apellido <span className="text-error">*</span>
                            </label>
                            <input
                                type="text"
                                {...register('lastName')}
                                className="w-full px-4 py-2.5 rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            {errors.lastName && (
                                <p className="mt-1 text-sm text-error">{errors.lastName.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Contact Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                                Email <span className="text-error">*</span>
                            </label>
                            <input
                                type="email"
                                {...register('email')}
                                className="w-full px-4 py-2.5 rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-error">{errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                                Teléfono
                            </label>
                            <input
                                type="tel"
                                {...register('phone')}
                                className="w-full px-4 py-2.5 rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>

                    {/* Professional Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                                Especialidad
                            </label>
                            <input
                                type="text"
                                {...register('specialty')}
                                className="w-full px-4 py-2.5 rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Ej: Podología, Fisioterapia"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                                Número de Licencia
                            </label>
                            <input
                                type="text"
                                {...register('licenseNumber')}
                                className="w-full px-4 py-2.5 rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Número de colegiatura"
                            />
                        </div>
                    </div>

                    {/* Role */}
                    <div>
                        <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                            Rol <span className="text-error">*</span>
                        </label>
                        <select
                            {...register('role')}
                            className="w-full px-4 py-2.5 rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            {Object.entries(USER_ROLE_LABELS)
                                .filter(([key]) => key !== 'PATIENT')
                                .map(([key, label]) => (
                                    <option key={key} value={key}>
                                        {label}
                                    </option>
                                ))}
                        </select>
                        {errors.role && (
                            <p className="mt-1 text-sm text-error">{errors.role.message}</p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={isUpdating}
                            style={{
                                background: 'linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-accent)) 100%)'
                            }}
                            className="px-6 py-2.5 text-white rounded-lg hover:opacity-90 transition-opacity duration-200 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isUpdating && (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            )}
                            Actualizar Personal
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard/staff')}
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

export default EditStaffPage;
