import { ServiceTemplate } from '@/lib/constants/service-templates';

interface SummaryCardProps {
    schedules: any[];
    paymentMethods: string[];
    consultationTypes: string[];
    services: ServiceTemplate[];
}

export const SummaryCard = ({
    schedules,
    paymentMethods,
    consultationTypes,
    services
}: SummaryCardProps) => (
    <div className="bg-gradient-to-br from-primary/5 to-secondary/5 p-6 rounded-xl border border-primary/10">
        <h3 className="font-semibold text-[rgb(var(--text-primary))] mb-3">Resumen de Configuración</h3>
        <ul className="space-y-2 text-sm text-[rgb(var(--text-secondary))]">
            <SummaryItem text="Datos del consultorio configurados" />
            <SummaryItem text={`${schedules.filter(s => s.enabled).length} días de atención`} />
            <SummaryItem text={`${paymentMethods.length} métodos de pago`} />
            <SummaryItem text={`${consultationTypes.length} tipos de consulta`} />
            <SummaryItem text={`${services.length} servicios configurados`} />
        </ul>
    </div>
);

const SummaryItem = ({ text }: { text: string }) => (
    <li className="flex items-center gap-2">
        <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        {text}
    </li>
);
