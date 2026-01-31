import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { OnboardingService } from '@/services/onboarding.service';
import { basicClinicDataSchema, type BasicClinicData } from '@/lib/validations/onboarding';
import { ServiceTemplate } from '@/lib/constants/service-templates';
import { DAYS_OF_WEEK, PAYMENT_METHODS, CONSULTATION_TYPES } from '@/lib/constants/onboarding';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { BasicDataStep } from '@/components/onboarding/steps/BasicDataStep';
import { ServicesStep } from '@/components/onboarding/steps/ServicesStep';
import { StepHeader } from '@/components/onboarding/StepHeader';
import { ErrorAlert } from '@/components/onboarding/ErrorAlert';
import { StepNavigation } from '@/components/onboarding/StepNavigation';
import { SelectableCard } from '@/components/onboarding/SelectableCard';
import { SummaryCard } from '@/components/onboarding/SummaryCard';
import {
    ClockIcon,
    CreditCardIcon,
    DocumentIcon,
    CheckCircleIcon
} from '@/components/icons/OnboardingIcons';
import logoIcon from '@/assets/images/logos/logo-icon.png';

const Onboarding = () => {
    const navigate = useNavigate();
    const {
        currentStep,
        nextStep,
        prevStep,
        setBasicData,
        setBusinessHours,
        setPaymentMethods,
        setConsultationTypes,
        setServices,
        basicData,
        businessHours,
        paymentMethods,
        consultationTypes,
        reset,
    } = useOnboardingStore();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Step 1: Basic Data Form
    const basicDataForm = useForm({
        resolver: zodResolver(basicClinicDataSchema),
        defaultValues: basicData || {},
    });

    // Step 2: Business Hours
    const [schedules, setSchedules] = useState(
        businessHours?.schedules || DAYS_OF_WEEK.map(day => ({
            dayOfWeek: day.value,
            startTime: '09:00',
            endTime: '18:00',
            enabled: day.value !== 'SUNDAY',
        }))
    );

    // Step 3: Payment Methods
    const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>(
        paymentMethods?.methods?.map(m => m.type) || ['CASH']
    );

    // Step 4: Consultation Types
    const [selectedConsultationTypes, setSelectedConsultationTypes] = useState<string[]>(
        consultationTypes?.types || ['IN_PERSON']
    );

    // Step 5: Services
    const [selectedServices, setSelectedServices] = useState<ServiceTemplate[]>([]);

    // Handlers
    const onStep1Submit = (data: BasicClinicData) => {
        setBasicData(data);
        nextStep();
    };

    const handleStep2Next = () => {
        const enabledSchedules = schedules.filter(s => s.enabled);
        if (enabledSchedules.length === 0) {
            setError('Debe configurar al menos un día de atención');
            return;
        }
        setBusinessHours({ schedules });
        setError(null);
        nextStep();
    };

    const handleStep3Next = () => {
        if (selectedPaymentMethods.length === 0) {
            setError('Debe seleccionar al menos un método de pago');
            return;
        }
        setPaymentMethods({
            methods: selectedPaymentMethods.map(type => ({
                type: type as any,
                otherName: null
            })),
        });
        setError(null);
        nextStep();
    };

    const handleStep4Next = () => {
        if (selectedConsultationTypes.length === 0) {
            setError('Debe seleccionar al menos un tipo de consulta');
            return;
        }
        setConsultationTypes({ types: selectedConsultationTypes as any });
        setError(null);
        nextStep();
    };

    const handleStep5Next = () => {
        if (selectedServices.length === 0) {
            setError('Debe agregar al menos un servicio');
            return;
        }
        setServices({
            services: selectedServices.map(s => ({
                name: s.name,
                description: s.description,
                category: s.category,
                basePrice: s.basePrice,
                currency: s.currency,
                duration: s.duration,
            })),
        });
        setError(null);
        nextStep();
    };

    const handleComplete = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const storeState = useOnboardingStore.getState();

            const completeData = {
                basicData: storeState.basicData!,
                businessHours: storeState.businessHours!,
                paymentMethods: storeState.paymentMethods!,
                consultationTypes: storeState.consultationTypes!,
                services: storeState.services!,
                scheduleConfig: {
                    defaultAppointmentDuration: 30,
                    appointmentInterval: 0,
                    allowOnlineBooking: false,
                },
                notifications: {
                    notificationEmail: true,
                    notificationWhatsapp: false,
                    whatsappNumber: null,
                    sendReminders: true,
                    reminderHoursBefore: 24,
                },
                invitations: { invitations: [] },
            };

            const result = await OnboardingService.completeOnboarding(completeData as any);

            if (result.success) {
                // Clear onboarding store after successful completion
                reset();
                navigate('/app/dashboard');
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Ocurrió un error inesperado');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleScheduleDay = (dayValue: string) => {
        setSchedules(prev =>
            prev.map(s =>
                s.dayOfWeek === dayValue ? { ...s, enabled: !s.enabled } : s
            )
        );
    };

    const updateScheduleTime = (dayValue: string, field: 'startTime' | 'endTime', value: string) => {
        setSchedules(prev =>
            prev.map(s =>
                s.dayOfWeek === dayValue ? { ...s, [field]: value } : s
            )
        );
    };

    const togglePaymentMethod = (method: string) => {
        setSelectedPaymentMethods(prev =>
            prev.includes(method)
                ? prev.filter(m => m !== method)
                : [...prev, method]
        );
    };

    const toggleConsultationType = (type: string) => {
        setSelectedConsultationTypes(prev =>
            prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type]
        );
    };

    const renderStep = () => {
        switch (currentStep) {
            case 0:
                return <BasicDataStep form={basicDataForm} onSubmit={onStep1Submit} />;

            case 1:
                return (
                    <div className="space-y-5">
                        <StepHeader
                            icon={<ClockIcon />}
                            title="Horarios de Atención"
                            description="Configura tus días y horarios de trabajo"
                            gradient="from-secondary/20 to-secondary/5"
                            iconColor="text-secondary"
                        />

                        {error && <ErrorAlert message={error} />}

                        <div className="space-y-3">
                            {DAYS_OF_WEEK.map((day) => {
                                const schedule = schedules.find(s => s.dayOfWeek === day.value);
                                return (
                                    <div key={day.value} className="flex items-center gap-3 p-3 rounded-lg bg-[rgb(var(--bg-secondary))] hover:bg-[rgb(var(--bg-tertiary))] transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={schedule?.enabled}
                                            onChange={() => toggleScheduleDay(day.value)}
                                            className="w-5 h-5 rounded border-2 border-[rgb(var(--border-primary))] text-primary focus:ring-2 focus:ring-primary/20"
                                        />
                                        <span className="flex-1 font-medium text-[rgb(var(--text-primary))]">{day.label}</span>
                                        {schedule?.enabled && (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="time"
                                                    value={schedule.startTime}
                                                    onChange={(e) => updateScheduleTime(day.value, 'startTime', e.target.value)}
                                                    className="px-3 py-1.5 rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-primary))] text-[rgb(var(--text-primary))] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                />
                                                <span className="text-[rgb(var(--text-secondary))]">-</span>
                                                <input
                                                    type="time"
                                                    value={schedule.endTime}
                                                    onChange={(e) => updateScheduleTime(day.value, 'endTime', e.target.value)}
                                                    className="px-3 py-1.5 rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-primary))] text-[rgb(var(--text-primary))] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <StepNavigation onBack={prevStep} onNext={handleStep2Next} />
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-5">
                        <StepHeader
                            icon={<CreditCardIcon />}
                            title="Métodos de Pago"
                            description="Selecciona los métodos de pago que aceptas"
                            gradient="from-accent/20 to-accent/5"
                            iconColor="text-accent"
                        />

                        {error && <ErrorAlert message={error} />}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {PAYMENT_METHODS.map((method) => (
                                <SelectableCard
                                    key={method.value}
                                    label={method.label}
                                    isSelected={selectedPaymentMethods.includes(method.value)}
                                    onClick={() => togglePaymentMethod(method.value)}
                                />
                            ))}
                        </div>

                        <StepNavigation onBack={prevStep} onNext={handleStep3Next} />
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-5">
                        <StepHeader
                            icon={<DocumentIcon />}
                            title="Tipos de Consulta"
                            description="¿Cómo atiendes a tus pacientes?"
                            gradient="from-info/20 to-info/5"
                            iconColor="text-info"
                        />

                        {error && <ErrorAlert message={error} />}

                        <div className="space-y-3">
                            {CONSULTATION_TYPES.map((type) => (
                                <SelectableCard
                                    key={type.value}
                                    label={type.label}
                                    isSelected={selectedConsultationTypes.includes(type.value)}
                                    onClick={() => toggleConsultationType(type.value)}
                                    fullWidth
                                />
                            ))}
                        </div>

                        <StepNavigation onBack={prevStep} onNext={handleStep4Next} />
                    </div>
                );

            case 4:
                return (
                    <ServicesStep
                        selectedServices={selectedServices}
                        onServicesChange={setSelectedServices}
                        onNext={handleStep5Next}
                        onBack={prevStep}
                        error={error}
                    />
                );

            default:
                return (
                    <div className="space-y-5">
                        <StepHeader
                            icon={<CheckCircleIcon />}
                            title="¡Todo Listo!"
                            description="Tu consultorio está configurado y listo para comenzar"
                            gradient="from-success/20 to-success/5"
                            iconColor="text-success"
                            large
                        />

                        {error && <ErrorAlert message={error} />}

                        <SummaryCard
                            schedules={schedules}
                            paymentMethods={selectedPaymentMethods}
                            consultationTypes={selectedConsultationTypes}
                            services={selectedServices}
                        />

                        <div className="flex gap-3 mt-6">
                            <Button variant="outline" onClick={prevStep} className="flex-1">
                                Atrás
                            </Button>
                            <Button onClick={handleComplete} isLoading={isLoading} className="flex-1">
                                Completar Configuración
                            </Button>
                        </div>
                    </div>
                );
        }
    };

    const totalSteps = 6;
    const progress = ((currentStep + 1) / totalSteps) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[rgb(var(--bg-primary))] to-[rgb(var(--bg-secondary))] py-6 px-4 sm:px-6 lg:px-8">
            <div className="absolute top-4 right-4 z-10">
                <ThemeToggle />
            </div>

            <div className="max-w-2xl mx-auto animate-fade-in">
                <div className="flex justify-center mb-6">
                    <img
                        src={logoIcon}
                        alt="ClinqApp Logo"
                        className="w-14 h-14 animate-scale-in drop-shadow-lg"
                    />
                </div>

                <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                        <h1 className="text-xl sm:text-2xl font-bold text-[rgb(var(--text-primary))]">
                            Configuración Inicial
                        </h1>
                        <span className="text-xs sm:text-sm font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary">
                            {currentStep + 1}/{totalSteps}
                        </span>
                    </div>

                    <div className="w-full bg-[rgb(var(--bg-tertiary))] rounded-full h-2 overflow-hidden shadow-inner">
                        <div
                            className="bg-gradient-to-r from-primary via-secondary to-accent h-2 rounded-full transition-all duration-700 ease-out shadow-sm"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <div className="card p-6 sm:p-8 animate-slide-up shadow-xl">
                    {renderStep()}
                </div>

                <p className="text-center text-xs text-[rgb(var(--text-tertiary))] mt-6">
                    © 2026 ClinqApp. Sistema de gestión para profesionales de la salud.
                </p>
            </div>
        </div>
    );
};


export default Onboarding;
