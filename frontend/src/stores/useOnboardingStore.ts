import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
    BasicClinicData,
    BusinessHours,
    PaymentMethods,
    ConsultationTypes,
    Services,
    ScheduleConfig,
    Notifications,
    Invitations,
} from '@/lib/validations/onboarding';

export interface OnboardingState {
    // Current step (0-indexed)
    currentStep: number;

    // Data for each step
    basicData: Partial<BasicClinicData> | null;
    businessHours: Partial<BusinessHours> | null;
    paymentMethods: Partial<PaymentMethods> | null;
    consultationTypes: Partial<ConsultationTypes> | null;
    services: Partial<Services> | null;
    scheduleConfig: Partial<ScheduleConfig> | null;
    notifications: Partial<Notifications> | null;
    invitations: Partial<Invitations> | null;

    // Actions
    setCurrentStep: (step: number) => void;
    nextStep: () => void;
    prevStep: () => void;
    setBasicData: (data: Partial<BasicClinicData>) => void;
    setBusinessHours: (data: Partial<BusinessHours>) => void;
    setPaymentMethods: (data: Partial<PaymentMethods>) => void;
    setConsultationTypes: (data: Partial<ConsultationTypes>) => void;
    setServices: (data: Partial<Services>) => void;
    setScheduleConfig: (data: Partial<ScheduleConfig>) => void;
    setNotifications: (data: Partial<Notifications>) => void;
    setInvitations: (data: Partial<Invitations>) => void;
    reset: () => void;

    // Helper to check if a step is completed
    isStepCompleted: (step: number) => boolean;
}

const TOTAL_STEPS = 9;

const initialState = {
    currentStep: 0,
    basicData: null,
    businessHours: null,
    paymentMethods: null,
    consultationTypes: null,
    services: null,
    scheduleConfig: null,
    notifications: null,
    invitations: null,
};

export const useOnboardingStore = create<OnboardingState>()(
    persist(
        (set, get) => ({
            ...initialState,

            setCurrentStep: (step: number) => {
                if (step >= 0 && step < TOTAL_STEPS) {
                    set({ currentStep: step });
                }
            },

            nextStep: () => {
                const { currentStep } = get();
                if (currentStep < TOTAL_STEPS - 1) {
                    set({ currentStep: currentStep + 1 });
                }
            },

            prevStep: () => {
                const { currentStep } = get();
                if (currentStep > 0) {
                    set({ currentStep: currentStep - 1 });
                }
            },

            setBasicData: (data: Partial<BasicClinicData>) => {
                set((state) => ({
                    basicData: { ...state.basicData, ...data },
                }));
            },

            setBusinessHours: (data: Partial<BusinessHours>) => {
                set((state) => ({
                    businessHours: { ...state.businessHours, ...data },
                }));
            },

            setPaymentMethods: (data: Partial<PaymentMethods>) => {
                set((state) => ({
                    paymentMethods: { ...state.paymentMethods, ...data },
                }));
            },

            setConsultationTypes: (data: Partial<ConsultationTypes>) => {
                set((state) => ({
                    consultationTypes: { ...state.consultationTypes, ...data },
                }));
            },

            setServices: (data: Partial<Services>) => {
                set((state) => ({
                    services: { ...state.services, ...data },
                }));
            },

            setScheduleConfig: (data: Partial<ScheduleConfig>) => {
                set((state) => ({
                    scheduleConfig: { ...state.scheduleConfig, ...data },
                }));
            },

            setNotifications: (data: Partial<Notifications>) => {
                set((state) => ({
                    notifications: { ...state.notifications, ...data },
                }));
            },

            setInvitations: (data: Partial<Invitations>) => {
                set((state) => ({
                    invitations: { ...state.invitations, ...data },
                }));
            },

            reset: () => set(initialState),

            isStepCompleted: (step: number): boolean => {
                const state = get();

                switch (step) {
                    case 0: // Basic Data
                        return !!(
                            state.basicData?.name &&
                            state.basicData?.ruc &&
                            state.basicData?.address &&
                            state.basicData?.phone &&
                            state.basicData?.email
                        );

                    case 1: // Business Hours
                        return !!(
                            state.businessHours?.schedules &&
                            state.businessHours.schedules.length > 0
                        );

                    case 2: // Payment Methods
                        return !!(
                            state.paymentMethods?.methods &&
                            state.paymentMethods.methods.length > 0
                        );

                    case 3: // Consultation Types
                        return !!(
                            state.consultationTypes?.types &&
                            state.consultationTypes.types.length > 0
                        );

                    case 4: // Services
                        return !!(
                            state.services?.services &&
                            state.services.services.length > 0
                        );

                    case 5: // Schedule Config
                        return !!(
                            state.scheduleConfig?.defaultAppointmentDuration !== undefined
                        );

                    case 6: // Notifications
                        return !!(
                            state.notifications?.notificationEmail !== undefined ||
                            state.notifications?.notificationWhatsapp !== undefined
                        );

                    case 7: // Invitations (optional)
                        return true; // This step is optional

                    case 8: // Summary (always accessible)
                        return true;

                    default:
                        return false;
                }
            },
        }),
        {
            name: 'clinq-onboarding-storage',
            partialize: (state) => ({
                currentStep: state.currentStep,
                basicData: state.basicData,
                businessHours: state.businessHours,
                paymentMethods: state.paymentMethods,
                consultationTypes: state.consultationTypes,
                services: state.services,
                scheduleConfig: state.scheduleConfig,
                notifications: state.notifications,
                invitations: state.invitations,
            }),
        }
    )
);
