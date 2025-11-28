// Service templates for podiatry clinics
export interface ServiceTemplate {
    id: string;
    name: string;
    description: string;
    category: 'DIAGNOSTIC' | 'TREATMENT' | 'FOLLOWUP' | 'OTHER';
    basePrice: number;
    currency: 'PEN' | 'USD';
    duration: number;
    icon?: string;
}

export const PODIATRY_SERVICE_TEMPLATES: ServiceTemplate[] = [
    {
        id: 'general-consultation',
        name: 'Consulta Podológica General',
        description: 'Evaluación completa del pie y diagnóstico de patologías',
        category: 'DIAGNOSTIC',
        basePrice: 80,
        currency: 'PEN',
        duration: 60,
    },
    {
        id: 'nail-treatment',
        name: 'Tratamiento de Uñas',
        description: 'Corte, limado y tratamiento de uñas encarnadas',
        category: 'TREATMENT',
        basePrice: 60,
        currency: 'PEN',
        duration: 45,
    },
    {
        id: 'callus-removal',
        name: 'Eliminación de Callos y Durezas',
        description: 'Tratamiento de hiperqueratosis y callosidades',
        category: 'TREATMENT',
        basePrice: 70,
        currency: 'PEN',
        duration: 45,
    },
    {
        id: 'diabetic-foot',
        name: 'Pie Diabético',
        description: 'Evaluación y cuidado especializado para pacientes diabéticos',
        category: 'DIAGNOSTIC',
        basePrice: 100,
        currency: 'PEN',
        duration: 60,
    },
    {
        id: 'orthopedic-insoles',
        name: 'Plantillas Ortopédicas',
        description: 'Evaluación biomecánica y confección de plantillas personalizadas',
        category: 'TREATMENT',
        basePrice: 250,
        currency: 'PEN',
        duration: 90,
    },
    {
        id: 'sports-podiatry',
        name: 'Podología Deportiva',
        description: 'Evaluación y tratamiento para deportistas',
        category: 'DIAGNOSTIC',
        basePrice: 120,
        currency: 'PEN',
        duration: 75,
    },
    {
        id: 'pediatric-podiatry',
        name: 'Podología Pediátrica',
        description: 'Evaluación y tratamiento especializado para niños',
        category: 'DIAGNOSTIC',
        basePrice: 90,
        currency: 'PEN',
        duration: 60,
    },
    {
        id: 'fungal-treatment',
        name: 'Tratamiento de Hongos',
        description: 'Diagnóstico y tratamiento de onicomicosis',
        category: 'TREATMENT',
        basePrice: 80,
        currency: 'PEN',
        duration: 45,
    },
    {
        id: 'wart-removal',
        name: 'Eliminación de Verrugas Plantares',
        description: 'Tratamiento de papilomas plantares',
        category: 'TREATMENT',
        basePrice: 90,
        currency: 'PEN',
        duration: 45,
    },
    {
        id: 'biomechanical-study',
        name: 'Estudio Biomecánico',
        description: 'Análisis de la marcha y pisada',
        category: 'DIAGNOSTIC',
        basePrice: 150,
        currency: 'PEN',
        duration: 90,
    },
    {
        id: 'followup',
        name: 'Control y Seguimiento',
        description: 'Revisión de tratamientos en curso',
        category: 'FOLLOWUP',
        basePrice: 50,
        currency: 'PEN',
        duration: 30,
    },
];

// Helper to get service by ID
export const getServiceTemplateById = (id: string): ServiceTemplate | undefined => {
    return PODIATRY_SERVICE_TEMPLATES.find(s => s.id === id);
};

// Helper to get services by category
export const getServicesByCategory = (category: ServiceTemplate['category']): ServiceTemplate[] => {
    return PODIATRY_SERVICE_TEMPLATES.filter(s => s.category === category);
};
