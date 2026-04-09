import { createPortal } from 'react-dom';
import QuickPatientForm from './QuickPatientForm';

interface QuickPatientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (patientId: string) => void;
}

const QuickPatientModal = ({ isOpen, onClose, onSuccess }: QuickPatientModalProps) => {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Overlay */}
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300 animate-fade-in" 
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                    }}
                    aria-hidden="true"
                ></div>
                
                {/* Centering trick */}
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                
                {/* Modal content */}
                <div 
                    className="inline-block align-bottom bg-[rgb(var(--bg-card))] rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all duration-300 ease-out sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-10 animate-slide-in-from-bottom sm:animate-scale-in"
                    onClick={(e) => e.stopPropagation()}
                >
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
        </div>,
        document.body
    );
};

export default QuickPatientModal;
