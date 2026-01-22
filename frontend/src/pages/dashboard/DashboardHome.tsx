import { useEffect, useState } from "react";
import { useUserStore } from "@/stores/useUserStore";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  DollarSign, 
  Calendar, 
  Users, 
  ArrowRight, 
  AlertCircle,
  RefreshCcw,
  Clock
} from "lucide-react";
import { dashboardService } from "@/services/dashboard.service";
import type { DashboardStats } from "@/types/dashboard.types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const DashboardHome = () => {
  const { user } = useUserStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await dashboardService.getStats();
      if (response.success) {
        setStats(response.data);
      } else {
        setError("No se pudieron cargar las estadísticas.");
      }
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      setError("Error de conexión con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formattedDate = format(new Date(), "EEEE, d 'de' MMMM", { locale: es });
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="w-12 h-12 text-destructive/50" />
        <p className="text-[rgb(var(--text-secondary))]">{error}</p>
        <Button onClick={fetchStats} variant="outline" className="gap-2">
          <RefreshCcw className="w-4 h-4" /> Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-[rgb(var(--text-primary))]">
          Hola, {user?.firstName || "Usuario"}
        </h1>
        <p className="text-[rgb(var(--text-secondary))] font-medium">
          {capitalize(formattedDate)}
        </p>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Ingresos */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-100 dark:border-zinc-800 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <DollarSign className="w-20 h-20 text-emerald-600" />
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600">
                <DollarSign className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                Ingresos del Mes
              </span>
            </div>
            {isLoading ? (
              <div className="h-9 w-32 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-lg" />
            ) : (
              <h2 className="text-3xl font-bold text-emerald-600 dark:text-emerald-500">
                S/ {(stats?.ingresosMes || 0).toLocaleString("es-PE", { minimumFractionDigits: 2 })}
              </h2>
            )}
          </div>
        </div>

        {/* Card 2: Citas Hoy */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-100 dark:border-zinc-800 group">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                Citas para Hoy
              </span>
            </div>
            {isLoading ? (
              <div className="h-9 w-20 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-lg" />
            ) : (
              <h2 className="text-3xl font-bold text-[rgb(var(--text-primary))]">
                {stats?.citasHoy || 0}
              </h2>
            )}
          </div>
        </div>

        {/* Card 3: Pacientes Nuevos */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-100 dark:border-zinc-800 group">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center text-purple-600">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                Pacientes Nuevos
              </span>
            </div>
            {isLoading ? (
              <div className="h-9 w-20 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-lg" />
            ) : (
              <h2 className="text-3xl font-bold text-[rgb(var(--text-primary))]">
                {stats?.pacientesNuevosMes || 0}
              </h2>
            )}
          </div>
        </div>
      </div>

      {/* Agenda Inmediata Section */}
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
            onClick={() => navigate("/dashboard/agenda")}
          >
            Ver toda la agenda <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden">
          {isLoading ? (
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
          ) : stats?.proximasCitas && stats.proximasCitas.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Hora</th>
                    <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Paciente</th>
                    <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Profesional</th>
                    <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {stats.proximasCitas.map((cita) => (
                    <tr key={cita.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-primary">
                          {format(new Date(cita.startTime), "HH:mm")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                            {cita.patient.firstName[0]}{cita.patient.lastName[0]}
                          </div>
                          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                            {cita.patient.firstName} {cita.patient.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                          Dr. {cita.professional.firstName}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={cita.status === 'CONFIRMED' ? 'default' : 'outline'}>
                          {cita.status === 'PENDING' ? 'Pendiente' : 
                           cita.status === 'CONFIRMED' ? 'Confirmado' : cita.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-zinc-400 hover:text-primary"
                          onClick={() => navigate(`/dashboard/agenda`)} // In a real app we might open the specific appointment
                        >
                          Ver Detalle
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 flex flex-col items-center justify-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-zinc-300" />
              </div>
              <div className="max-w-xs space-y-1">
                <p className="text-zinc-700 dark:text-zinc-200 font-bold">Todo tranquilo por ahora</p>
                <p className="text-sm text-zinc-500">No hay más citas próximas para hoy. ¡Aprovecha el tiempo!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
