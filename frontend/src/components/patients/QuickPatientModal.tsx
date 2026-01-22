import QuickPatientForm from './QuickPatientForm';

interface QuickPatientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (patientId: string) => void;
}

const QuickPatientModal = ({ isOpen, onClose, onSuccess }: QuickPatientModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity bg-black/50" onClick={onClose}></div>

                <div className="inline-block align-bottom bg-[rgb(var(--bg-card))] rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="px-6 pt-5 pb-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-[rgb(var(--text-primary))]">
                                Nuevo Paciente
                            </h3>
                            <button
                                type="button"
                                onClick={onClose}
                                className="text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <p className="text-sm text-[rgb(var(--text-secondary))] mb-4">
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
