import { useState } from 'react';
import { ServiceTemplate } from '@/lib/constants/service-templates';
import { Button } from '@/components/ui/Button';

interface ServiceSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    availableServices: ServiceTemplate[];
    selectedServices: ServiceTemplate[];
    onSelectService: (service: ServiceTemplate) => void;
}

export const ServiceSelectionModal = ({
    isOpen,
    onClose,
    availableServices,
    selectedServices,
    onSelectService,
}: ServiceSelectionModalProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

    if (!isOpen) return null;

    const filteredServices = availableServices.filter(service => {
        const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'ALL' || service.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const isSelected = (serviceId: string) => {
        return selectedServices.some(s => s.id === serviceId);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-[rgb(var(--bg-primary))] rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-scale-in">
                {/* Header */}
                <div className="sticky top-0 bg-[rgb(var(--bg-primary))] border-b border-[rgb(var(--border-primary))] p-6 z-10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-[rgb(var(--text-primary))]">
                            Seleccionar Servicios
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-[rgb(var(--bg-secondary))] rounded-lg transition-colors"
                        >
                            <svg className="w-6 h-6 text-[rgb(var(--text-secondary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Search and Filter */}
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--text-tertiary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Buscar servicios..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-tertiary))] focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-4 py-2.5 rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="ALL">Todas las categorías</option>
                            <option value="DIAGNOSTIC">Diagnóstico</option>
                            <option value="TREATMENT">Tratamiento</option>
                            <option value="FOLLOWUP">Seguimiento</option>
                            <option value="OTHER">Otro</option>
                        </select>
                    </div>
                </div>

                {/* Services Grid */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {filteredServices.map((service) => (
                            <button
                                key={service.id}
                                onClick={() => onSelectService(service)}
                                className={`p-4 rounded-xl border-2 transition-all text-left hover:shadow-md ${isSelected(service.id)
                                        ? 'border-primary bg-primary/5 shadow-sm'
                                        : 'border-[rgb(var(--border-primary))] hover:border-primary/50'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="text-3xl">{service.icon}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-[rgb(var(--text-primary))] truncate">
                                                {service.name}
                                            </h3>
                                            {isSelected(service.id) && (
                                                <svg className="w-5 h-5 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                        <p className="text-sm text-[rgb(var(--text-secondary))] line-clamp-2 mb-2">
                                            {service.description}
                                        </p>
                                        <div className="flex items-center gap-3 text-sm">
                                            <span className="font-medium text-primary">
                                                S/ {service.basePrice}
                                            </span>
                                            <span className="text-[rgb(var(--text-tertiary))]">•</span>
                                            <span className="text-[rgb(var(--text-secondary))]">
                                                {service.duration} min
                                            </span>
                                            <span className="ml-auto px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                                                {service.category === 'DIAGNOSTIC' ? 'Diagnóstico' :
                                                    service.category === 'TREATMENT' ? 'Tratamiento' :
                                                        service.category === 'FOLLOWUP' ? 'Seguimiento' : 'Otro'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {filteredServices.length === 0 && (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 mx-auto text-[rgb(var(--text-tertiary))] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-[rgb(var(--text-secondary))]">
                                No se encontraron servicios
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-[rgb(var(--bg-primary))] border-t border-[rgb(var(--border-primary))] p-6">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-[rgb(var(--text-secondary))]">
                            {selectedServices.length} servicio{selectedServices.length !== 1 ? 's' : ''} seleccionado{selectedServices.length !== 1 ? 's' : ''}
                        </p>
                        <Button onClick={onClose}>
                            Confirmar Selección
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
