import QuickPatientForm from './QuickPatientForm';

interface QuickPatientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (patientId: string) => void;
}

/**
 * Nested overlay for AppointmentDrawer (Sheet).
 * Must render as a descendant of SheetContent — not a body portal —
 * so Radix focus trap can keep keyboard input in these fields.
 */
const QuickPatientModal = ({ isOpen, onClose, onSuccess }: QuickPatientModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
                <div
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                    aria-hidden="true"
                />

                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="quick-patient-title"
                    className="relative z-10 w-full max-w-lg rounded-2xl bg-[rgb(var(--bg-card))] text-left shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="px-6 pt-5 pb-4">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <h3
                                id="quick-patient-title"
                                className="text-xl font-semibold text-[rgb(var(--text-primary))]"
                            >
                                Nuevo Paciente
                            </h3>
                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Cerrar"
                                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <p className="mb-4 text-sm text-[rgb(var(--text-secondary))]">
                            Completa los datos básicos del paciente para continuar con la cita
                        </p>

                        <QuickPatientForm onSuccess={onSuccess} onCancel={onClose} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickPatientModal;
