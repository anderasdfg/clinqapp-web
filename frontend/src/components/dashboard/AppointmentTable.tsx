import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { ProximaCita } from '@/types/dashboard.types';

interface AppointmentTableProps {
  appointments: ProximaCita[];
  isLoading: boolean;
  onViewDetail: (appointmentId: string) => void;
}

const getStatusBadge = (status: string) => {
  const statusMap: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
    SCHEDULED: { variant: 'default', label: 'Programada' },
    CONFIRMED: { variant: 'secondary', label: 'Confirmada' },
    COMPLETED: { variant: 'outline', label: 'Completada' },
    CANCELLED: { variant: 'destructive', label: 'Cancelada' },
  };

  const config = statusMap[status] || { variant: 'default' as const, label: status };
  
  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
};

export function AppointmentTable({ appointments, isLoading, onViewDetail }: AppointmentTableProps) {
  if (isLoading) {
    return (
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 flex items-center justify-between animate-pulse">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-zinc-100 dark:bg-zinc-800 rounded" />
                <div className="h-3 w-20 bg-zinc-100 dark:bg-zinc-800 rounded" />
              </div>
            </div>
            <div className="h-8 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center">
          <Calendar className="w-8 h-8 text-zinc-300" />
        </div>
        <div className="max-w-xs space-y-1">
          <p className="text-zinc-700 dark:text-zinc-200 font-bold">
            Todo tranquilo por ahora
          </p>
          <p className="text-sm text-zinc-500">
            No hay más citas próximas para hoy. ¡Aprovecha el tiempo!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-zinc-50 dark:bg-zinc-800/50">
          <tr>
            <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Hora
            </th>
            <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Paciente
            </th>
            <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Profesional
            </th>
            <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">
              Acción
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {appointments.map((appointment) => (
            <tr key={appointment.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm font-medium text-[rgb(var(--text-primary))]">
                  {format(new Date(appointment.startTime), 'HH:mm', { locale: es })}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-[rgb(var(--text-primary))]">
                  {appointment.patient.firstName} {appointment.patient.lastName}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-zinc-500">
                  {appointment.professional.firstName}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(appointment.status)}
              </td>
              <td className="px-6 py-4 text-right">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-zinc-400 hover:text-primary"
                  onClick={() => onViewDetail(appointment.id)}
                >
                  Ver Detalle
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
