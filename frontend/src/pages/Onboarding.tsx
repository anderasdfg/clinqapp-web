import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { OnboardingService } from '@/services/onboarding.service';
import { basicClinicDataSchema, type BasicClinicData } from '@/lib/validations/onboarding';
import { ServiceTemplate } from '@/lib/constants/service-templates';
import { DAYS_OF_WEEK } from '@/lib/constants/onboarding';
import {
    defaultSchedules,
    schedulesFromPersisted,
    servicesFromPersisted,
} from '@/lib/onboarding-local-sync';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { BasicDataStep } from '@/components/onboarding/steps/BasicDataStep';
import { ServicesStep } from '@/components/onboarding/steps/ServicesStep';
import { StepHeader } from '@/components/onboarding/StepHeader';
import { ErrorAlert } from '@/components/onboarding/ErrorAlert';
import { StepNavigation } from '@/components/onboarding/StepNavigation';
import { SummaryCard } from '@/components/onboarding/SummaryCard';
import {
    ClockIcon,
    CheckCircleIcon
} from '@/components/icons/OnboardingIcons';
import logoIcon from '@/assets/images/logos/logo-icon.png';

const Onboarding = () => {
    const navigate = useNavigate();
    const {
        currentStep,
        nextStep,
        prevStep,
        setCurrentStep,
        setBasicData,
        setBusinessHours,
        setPaymentMethods,
        setConsultationTypes,
        setServices,
        basicData,
        reset,
    } = useOnboardingStore();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // Gate until zustand persist finishes — local useState must not race defaults over storage
    const [hydrated, setHydrated] = useState(() => useOnboardingStore.persist.hasHydrated());

    // Step 1: Basic Data Form
    const basicDataForm = useForm({
        resolver: zodResolver(basicClinicDataSchema),
        defaultValues: basicData || {},
    });

    // Step 2: Business Hours
    const [schedules, setSchedules] = useState(defaultSchedules);

    // Step 3: Payment Methods
    const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>(['CASH']);

    // Step 4: Consultation Types
    const [selectedConsultationTypes, setSelectedConsultationTypes] = useState<string[]>(['IN_PERSON']);

    // Step 5: Services
    const [selectedServices, setSelectedServices] = useState<ServiceTemplate[]>([]);

    useEffect(() => {
        const syncFromStore = () => {
            const s = useOnboardingStore.getState();
            setSchedules(schedulesFromPersisted(s.businessHours));
            setSelectedPaymentMethods(
                s.paymentMethods?.methods?.map((m) => m.type) || ['CASH']
            );
            setSelectedConsultationTypes(s.consultationTypes?.types || ['IN_PERSON']);
            setSelectedServices(servicesFromPersisted(s.services));
            if (s.basicData) basicDataForm.reset(s.basicData as BasicClinicData);
            setHydrated(true);
        };

        if (useOnboardingStore.persist.hasHydrated()) {
            syncFromStore();
        }
        return useOnboardingStore.persist.onFinishHydration(syncFromStore);
    }, [basicDataForm]);

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
        setBusinessHours({ schedules: schedules as any });
        // ponytail: auto-defaults for day-1; payments/consultation types later from settings
        setPaymentMethods({
            methods: [{ type: 'CASH' as any, otherName: null }],
        });
        setConsultationTypes({ types: ['IN_PERSON'] as any });
        setSelectedPaymentMethods(['CASH']);
        setSelectedConsultationTypes(['IN_PERSON']);
        setError(null);
        nextStep();
    };

    const handleStep3Next = () => {
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

            if (!storeState.services?.services?.length) {
                setError('Agrega al menos un servicio antes de completar');
                setIsLoading(false);
                setCurrentStep(2);
                return;
            }

            const completeData = {
                basicData: storeState.basicData!,
                businessHours: storeState.businessHours!,
                paymentMethods: storeState.paymentMethods || {
                    methods: [{ type: 'CASH' as any, otherName: null }],
                },
                consultationTypes: storeState.consultationTypes || {
                    types: ['IN_PERSON'] as any,
                },
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
                    <ServicesStep
                        selectedServices={selectedServices}
                        onServicesChange={setSelectedServices}
                        onNext={handleStep3Next}
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
                            description="Tu consultorio está listo. Podrás ajustar pagos y tipos de consulta después."
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

    const totalSteps = 4;
    const progress = ((currentStep + 1) / totalSteps) * 100;

    if (!hydrated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[rgb(var(--bg-primary))] to-[rgb(var(--bg-secondary))]">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-label="Cargando configuración" />
            </div>
        );
    }

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
