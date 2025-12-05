import { useState } from 'react';
import { ServiceTemplate, PODIATRY_SERVICE_TEMPLATES } from '@/lib/constants/service-templates';
import { ServiceSelectionModal } from '../ServiceSelectionModal';
import { Button } from '@/components/ui/Button';

interface ServicesStepProps {
    selectedServices: ServiceTemplate[];
    onServicesChange: (services: ServiceTemplate[]) => void;
    onNext: () => void;
    onBack: () => void;
    error: string | null;
}

export const ServicesStep = ({
    selectedServices,
    onServicesChange,
    onNext,
    onBack,
    error,
}: ServicesStepProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSelectService = (service: ServiceTemplate) => {
        const isAlreadySelected = selectedServices.some(s => s.id === service.id);

        if (isAlreadySelected) {
            onServicesChange(selectedServices.filter(s => s.id !== service.id));
        } else {
            onServicesChange([...selectedServices, service]);
        }
    };

    const handleRemoveService = (serviceId: string) => {
        onServicesChange(selectedServices.filter(s => s.id !== serviceId));
    };

    return (
        <div className="space-y-5">
            <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-success/20 to-success/5 flex items-center justify-center mx-auto mb-4 animate-scale-in">
                    <svg className="w-7 h-7 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-[rgb(var(--text-primary))] mb-2">
                    Servicios
                </h2>
                <p className="text-sm text-[rgb(var(--text-secondary))]">
                    Selecciona los servicios que ofreces en tu consultorio
                </p>
            </div>

            {error && (
                <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg text-sm animate-slide-down">
                    {error}
                </div>
            )}

            {/* Selected Services */}
            {selectedServices.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                    {selectedServices.map((service) => (
                        <div key={service.id} className="p-4 rounded-xl border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-secondary))] hover:border-primary/30 transition-all group">
                            <div className="flex items-start gap-3">
                                <div className="text-2xl">{service.icon}</div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-[rgb(var(--text-primary))] truncate">{service.name}</h3>
                                    <p className="text-sm text-[rgb(var(--text-secondary))] mt-1 line-clamp-2">{service.description}</p>
                                    <div className="flex gap-4 mt-2 text-sm flex-wrap">
                                        {/* <span className="text-[rgb(var(--text-secondary))]">
                                            <span className="font-medium text-primary">S/ {service.basePrice}</span>
                                        </span> */}
                                        {/* <span className="text-[rgb(var(--text-secondary))]">
                                            {service.duration} min
                                        </span> */}
                                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                                            {service.category === 'DIAGNOSTIC' ? 'Diagnóstico' :
                                                service.category === 'TREATMENT' ? 'Tratamiento' :
                                                    service.category === 'FOLLOWUP' ? 'Seguimiento' : 'Otro'}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveService(service.id)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-error/10 rounded-lg text-error flex-shrink-0"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 border-2 border-dashed border-[rgb(var(--border-primary))] rounded-xl">
                    <svg className="w-16 h-16 mx-auto text-[rgb(var(--text-tertiary))] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-[rgb(var(--text-secondary))] mb-4">
                        No has seleccionado ningún servicio
                    </p>
                </div>
            )}

            {/* Add Services Button */}
            <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setIsModalOpen(true)}
            >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {selectedServices.length > 0 ? 'Agregar Más Servicios' : 'Seleccionar Servicios'}
            </Button>

            <div className="bg-info/10 border border-info/20 text-info px-4 py-3 rounded-lg text-sm">
                💡 Selecciona al menos un servicio. Podrás modificar precios y duraciones después.
            </div>

            <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={onBack} className="flex-1">
                    Atrás
                </Button>
                <Button onClick={onNext} className="flex-1">
                    Continuar
                </Button>
            </div>

            {/* Service Selection Modal */}
            <ServiceSelectionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                availableServices={PODIATRY_SERVICE_TEMPLATES}
                selectedServices={selectedServices}
                onSelectService={handleSelectService}
            />
        </div>
    );
};
