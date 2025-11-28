export const DAYS_OF_WEEK = [
    { value: 'MONDAY' as const, label: 'Lunes' },
    { value: 'TUESDAY' as const, label: 'Martes' },
    { value: 'WEDNESDAY' as const, label: 'Miércoles' },
    { value: 'THURSDAY' as const, label: 'Jueves' },
    { value: 'FRIDAY' as const, label: 'Viernes' },
    { value: 'SATURDAY' as const, label: 'Sábado' },
    { value: 'SUNDAY' as const, label: 'Domingo' },
];

export const PAYMENT_METHODS = [
    { value: 'CASH', label: 'Efectivo', icon: '💵' },
    { value: 'CREDIT_CARD', label: 'Tarjeta de Crédito', icon: '💳' },
    { value: 'DEBIT_CARD', label: 'Tarjeta de Débito', icon: '💳' },
    { value: 'MOBILE_PAYMENT', label: 'Yape/Plin', icon: '📱' },
    { value: 'BANK_TRANSFER', label: 'Transferencia Bancaria', icon: '🏦' },
];

export const CONSULTATION_TYPES = [
    { value: 'IN_PERSON' as const, label: 'Presencial', icon: '🏥', description: 'Atención en consultorio' },
    { value: 'TELEMEDICINE' as const, label: 'Telemedicina', icon: '💻', description: 'Consulta virtual' },
    { value: 'HOME_VISIT' as const, label: 'Visita a Domicilio', icon: '🏠', description: 'Atención en casa del paciente' },
];
