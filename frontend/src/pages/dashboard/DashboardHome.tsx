import { useUserStore } from '@/stores/useUserStore';
import { useNavigate } from 'react-router-dom';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ErrorState } from '@/components/dashboard/ErrorState';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { AppointmentTable } from '@/components/dashboard/AppointmentTable';
import { Button } from '@/components/ui/Button';
import { DollarSign, Calendar, Users, ArrowRight, Clock } from 'lucide-react';

export default function DashboardHome() {
  const { user } = useUserStore();
  const navigate = useNavigate();
  const { stats, isLoading, error, refetch } = useDashboardStats();

  const handleViewAgenda = () => navigate('/app/dashboard/agenda');
  const handleViewAppointmentDetail = () => navigate('/app/dashboard/agenda');

  const formatCurrency = (amount: number) => {
    return `S/ ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
  };

  if (error) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <DashboardHeader userName={user?.firstName || 'Usuario'} />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Ingresos del Mes"
          value={formatCurrency(stats?.ingresosMes || 0)}
          icon={DollarSign}
          iconColor="text-emerald-600"
          iconBgColor="bg-emerald-50 dark:bg-emerald-950/30"
          valueColor="text-emerald-600 dark:text-emerald-500"
          isLoading={isLoading}
        />

        <StatsCard
          title="Citas para Hoy"
          value={stats?.citasHoy || 0}
          icon={Calendar}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-50 dark:bg-blue-950/30"
          isLoading={isLoading}
        />

        <StatsCard
          title="Pacientes Nuevos"
          value={stats?.pacientesNuevosMes || 0}
          icon={Users}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-50 dark:bg-purple-950/30"
          isLoading={isLoading}
        />
      </div>

      {/* Upcoming Appointments */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-[rgb(var(--text-primary))]">
              Agenda Inmediata (Hoy)
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary gap-1"
            onClick={handleViewAgenda}
          >
            Ver toda la agenda <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden">
          <AppointmentTable
            appointments={stats?.proximasCitas || []}
            isLoading={isLoading}
            onViewDetail={handleViewAppointmentDetail}
          />
        </div>
      </div>
    </div>
  );
}
