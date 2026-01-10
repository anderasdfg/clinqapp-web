import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { patientSchema, type PatientFormData } from '@/lib/validations/patient.validation';
import { usePatientsStore } from '@/stores/usePatientsStore';
import { REFERRAL_SOURCE_LABELS } from '@/types/patient.types';
import type { Patient } from '@/types/patient.types';
import { DatePicker } from '@/components/ui/DatePicker';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/Button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

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
        control,
        formState: { errors },
    } = useForm<PatientFormData>({
        resolver: zodResolver(patientSchema),
        mode: 'onBlur',
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
            <Card>
                <CardHeader>
                    <CardTitle>Información Personal</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">
                                Nombre <span className="text-error">*</span>
                            </Label>
                            <Input
                                id="firstName"
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
                            <Label htmlFor="lastName">
                                Apellido <span className="text-error">*</span>
                            </Label>
                            <Input
                                id="lastName"
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

                        <div className="space-y-2">
                            <Label htmlFor="dni">DNI</Label>
                            <Input
                                id="dni"
                                type="text"
                                inputMode="numeric"
                                maxLength={10}
                                placeholder="DNI (8 dígitos) o CE (10 dígitos)"
                                {...register('dni')}
                                onInput={(e) => {
                                    const target = e.target as HTMLInputElement;
                                    target.value = target.value.replace(/\D/g, '');
                                }}
                                className="h-9"
                            />
                            {errors.dni && (
                                <p className="text-sm text-error">{errors.dni.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dateOfBirth">Fecha de Nacimiento</Label>
                            <Controller
                                name="dateOfBirth"
                                control={control}
                                render={({ field }) => (
                                    <DatePicker
                                        date={field.value ? new Date(field.value) : undefined}
                                        onDateChange={(date) => {
                                            field.onChange(date ? date.toISOString().split('T')[0] : '');
                                        }}
                                        placeholder="Seleccionar fecha de nacimiento"
                                        fromYear={1900}
                                        toYear={new Date().getFullYear()}
                                    />
                                )}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="gender">Género</Label>
                            <Controller
                                name="gender"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger id="gender" className="h-9">
                                            <SelectValue placeholder="Seleccionar..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Masculino">Masculino</SelectItem>
                                            <SelectItem value="Femenino">Femenino</SelectItem>
                                            <SelectItem value="Otro">Otro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Información de Contacto</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">
                                Teléfono <span className="text-error">*</span>
                            </Label>
                            <Input
                                id="phone"
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
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                {...register('email')}
                                className="h-9"
                            />
                            {errors.email && (
                                <p className="text-sm text-error">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="address">Dirección</Label>
                            <Input
                                id="address"
                                type="text"
                                {...register('address')}
                                className="h-9"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="occupation">Ocupación</Label>
                            <Input
                                id="occupation"
                                type="text"
                                {...register('occupation')}
                                onInput={(e) => {
                                    const target = e.target as HTMLInputElement;
                                    target.value = target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
                                }}
                                className="h-9"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card>
                <CardHeader>
                    <CardTitle>Contacto de Emergencia</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="emergencyContact">Nombre</Label>
                            <Input
                                id="emergencyContact"
                                type="text"
                                {...register('emergencyContact')}
                                onInput={(e) => {
                                    const target = e.target as HTMLInputElement;
                                    target.value = target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
                                }}
                                className="h-9"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="emergencyPhone">Teléfono</Label>
                            <Input
                                id="emergencyPhone"
                                type="tel"
                                inputMode="numeric"
                                maxLength={9}
                                placeholder="987654321"
                                {...register('emergencyPhone')}
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
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Información Adicional</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="referralSource">Fuente de Referencia</Label>
                            <Controller
                                name="referralSource"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger id="referralSource" className="h-9">
                                            <SelectValue placeholder="Seleccionar..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(REFERRAL_SOURCE_LABELS).map(([value, label]) => (
                                                <SelectItem key={value} value={value}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/dashboard/patients')}
                    disabled={isSubmitting}
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                        background: 'linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-accent)) 100%)'
                    }}
                    className="hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    {isSubmitting && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    )}
                    {patient ? 'Actualizar' : 'Crear'} Paciente
                </Button>
            </div>
        </form>
    );
};

export default PatientForm;
