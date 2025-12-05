import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { patientSchema, type PatientFormData } from '@/lib/validations/patient.validation';
import { usePatientsStore } from '@/stores/usePatientsStore';
import { REFERRAL_SOURCE_LABELS } from '@/types/patient.types';
import type { Patient } from '@/types/patient.types';

interface PatientFormProps {
    patient?: Patient;
    onSuccess?: () => void;
}

const PatientForm = ({ patient, onSuccess }: PatientFormProps) => {
    const navigate = useNavigate();
    const { createPatient, updatePatient, isCreating, isUpdating } = usePatientsStore();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<PatientFormData>({
        resolver: zodResolver(patientSchema),
        defaultValues: patient
            ? {
                firstName: patient.firstName,
                lastName: patient.lastName,
                dni: patient.dni || '',
                phone: patient.phone,
                email: patient.email || '',
                dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.split('T')[0] : '',
                gender: patient.gender || '',
                address: patient.address || '',
                occupation: patient.occupation || '',
                emergencyContact: patient.emergencyContact || '',
                emergencyPhone: patient.emergencyPhone || '',
                referralSource: patient.referralSource,
                assignedProfessionalId: patient.assignedProfessionalId || '',
            }
            : undefined,
    });

    const onSubmit = async (data: PatientFormData) => {
        try {
            if (patient) {
                await updatePatient(patient.id, data);
            } else {
                await createPatient(data);
            }

            if (onSuccess) {
                onSuccess();
            } else {
                navigate('/dashboard/patients');
            }
        } catch (error) {
            console.error('Error saving patient:', error);
        }
    };

    const isSubmitting = isCreating || isUpdating;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="card p-6">
                <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-4">
                    Información Personal
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                            Nombre <span className="text-error">*</span>
                        </label>
                        <input
                            type="text"
                            {...register('firstName')}
                            className="w-full px-4 py-2.5 rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
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
                            className="w-full px-4 py-2.5 rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                        />
                        {errors.lastName && (
                            <p className="mt-1 text-sm text-error">{errors.lastName.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                            DNI
                        </label>
                        <input
                            type="text"
                            {...register('dni')}
                            className="w-full px-4 py-2.5 rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                        />
                        {errors.dni && (
                            <p className="mt-1 text-sm text-error">{errors.dni.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                            Fecha de Nacimiento
                        </label>
                        <input
                            type="date"
                            {...register('dateOfBirth')}
                            className="w-full px-4 py-2.5 rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                            Género
                        </label>
                        <select
                            {...register('gender')}
                            className="w-full px-4 py-2.5 rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                        >
                            <option value="">Seleccionar...</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Femenino">Femenino</option>
                            <option value="Otro">Otro</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Contact Information */}
            <div className="card p-6">
                <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-4">
                    Información de Contacto
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                            Teléfono <span className="text-error">*</span>
                        </label>
                        <input
                            type="tel"
                            {...register('phone')}
                            className="w-full px-4 py-2.5 rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                        />
                        {errors.phone && (
                            <p className="mt-1 text-sm text-error">{errors.phone.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            {...register('email')}
                            className="w-full px-4 py-2.5 rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-error">{errors.email.message}</p>
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                            Dirección
                        </label>
                        <input
                            type="text"
                            {...register('address')}
                            className="w-full px-4 py-2.5 rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                            Ocupación
                        </label>
                        <input
                            type="text"
                            {...register('occupation')}
                            className="w-full px-4 py-2.5 rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                        />
                    </div>
                </div>
            </div>

            {/* Emergency Contact */}
            <div className="card p-6">
                <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-4">
                    Contacto de Emergencia
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                            Nombre
                        </label>
                        <input
                            type="text"
                            {...register('emergencyContact')}
                            className="w-full px-4 py-2.5 rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                            Teléfono
                        </label>
                        <input
                            type="tel"
                            {...register('emergencyPhone')}
                            className="w-full px-4 py-2.5 rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                        />
                    </div>
                </div>
            </div>

            {/* Additional Information */}
            <div className="card p-6">
                <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-4">
                    Información Adicional
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                            Fuente de Referencia
                        </label>
                        <select
                            {...register('referralSource')}
                            className="w-full px-4 py-2.5 rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                        >
                            <option value="">Seleccionar...</option>
                            {Object.entries(REFERRAL_SOURCE_LABELS).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4">
                <button
                    type="button"
                    onClick={() => navigate('/dashboard/patients')}
                    className="px-6 py-2.5 rounded-lg border border-[rgb(var(--border-primary))] text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-secondary))] transition-colors duration-200 font-medium"
                    disabled={isSubmitting}
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                        background: 'linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-accent)) 100%)'
                    }}
                    className="px-6 py-2.5 text-white rounded-lg hover:opacity-90 transition-opacity duration-200 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isSubmitting && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    {patient ? 'Actualizar' : 'Crear'} Paciente
                </button>
            </div>
        </form>
    );
};

export default PatientForm;
