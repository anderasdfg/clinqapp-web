// src/app/dashboard/page.tsx
'use client';

import * as React from 'react';
import { Users, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const [userName, setUserName] = React.useState('');

  React.useEffect(() => {
    const loadUserName = async () => {
      try {
        const response = await fetch('/api/user/me');
        if (response.ok) {
          const data = await response.json();
          setUserName(`${data.firstName} ${data.lastName}`);
        }
      } catch (error) {
        console.error('Error loading user name:', error);
      }
    };

    loadUserName();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Bienvenido de vuelta{userName && `, ${userName}`}
          </p>
        </div>
        <Button className="bg-clinq-cyan-500 hover:bg-clinq-cyan-600 text-white">
          + Nueva cita
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="PACIENTES ATENDIDOS"
          value="24"
          subtitle="Hoy"
          icon={Users}
          trend={{ value: 12, label: 'vs ayer', isPositive: true }}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />
        <StatCard
          title="CITAS PROGRAMADAS"
          value="38"
          subtitle="Esta semana"
          icon={Calendar}
          trend={{ value: 5, label: 'vs semana pasada', isPositive: true }}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
        />
        <StatCard
          title="INGRESOS DEL MES"
          value="S/ 6,800"
          subtitle="Octubre 2025"
          icon={DollarSign}
          trend={{ value: 18, label: 'vs mes pasado', isPositive: true }}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        <StatCard
          title="TRATAMIENTOS ACTIVOS"
          value="17"
          subtitle="En progreso"
          icon={TrendingUp}
          iconColor="text-orange-600"
          iconBgColor="bg-orange-100"
        />
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue chart placeholder */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Ingresos mensuales
              </h3>
              <p className="text-sm text-gray-500">Últimos 7 meses</p>
            </div>
            <Button variant="ghost" size="sm" className="text-clinq-cyan-500">
              Ver detalle →
            </Button>
          </div>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <p className="text-sm">Gráfico de ingresos (por implementar)</p>
          </div>
        </div>

        {/* Appointments chart placeholder */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Citas esta semana
              </h3>
              <p className="text-sm text-gray-500">Por día</p>
            </div>
            <Button variant="ghost" size="sm" className="text-clinq-cyan-500">
              Ver agenda →
            </Button>
          </div>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <p className="text-sm">Gráfico de citas (por implementar)</p>
          </div>
        </div>
      </div>

      {/* Upcoming appointments and treatments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming appointments */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Próximas citas</h3>
            <Button variant="ghost" size="sm" className="text-clinq-cyan-500">
              Ver todas →
            </Button>
          </div>
          <div className="space-y-4">
            {/* Appointment items */}
            {[
              {
                patient: 'María García',
                time: '09:00',
                type: 'Evaluación inicial',
                status: 'Confirmado',
              },
              {
                patient: 'Carlos López',
                time: '10:30',
                type: 'Control de tratamiento',
                status: 'Confirmado',
              },
              {
                patient: 'Ana Martínez',
                time: '11:45',
                type: 'Limpieza de callos',
                status: 'Pendiente',
              },
            ].map((appointment, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-clinq-cyan-300 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-clinq-purple-900 text-white rounded-full flex items-center justify-center font-semibold">
                    {appointment.patient.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{appointment.patient}</p>
                    <p className="text-sm text-gray-500">{appointment.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{appointment.time}</p>
                  <span
                    className={`inline-block text-xs px-2 py-1 rounded ${
                      appointment.status === 'Confirmado'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {appointment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Treatments in progress */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Tratamientos en progreso
            </h3>
            <Button variant="ghost" size="sm" className="text-clinq-cyan-500">
              Ver todos →
            </Button>
          </div>
          <div className="space-y-4">
            {/* Treatment items */}
            {[
              {
                patient: 'Roberto Díaz',
                treatment: 'Tratamiento pie diabético',
                progress: 37.5,
                sessions: '3/8',
              },
              {
                patient: 'Carmen Ruiz',
                treatment: 'Ortesis plantar',
                progress: 83.3,
                sessions: '5/6',
              },
              {
                patient: 'José Fernández',
                treatment: 'Papiloma plantar',
                progress: 50,
                sessions: '2/4',
              },
            ].map((treatment, index) => (
              <div key={index} className="p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900">{treatment.patient}</p>
                    <p className="text-sm text-gray-500">{treatment.treatment}</p>
                  </div>
                  <span className="text-sm font-semibold text-clinq-cyan-600">
                    {treatment.sessions}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-clinq-cyan-500 to-clinq-purple-500 h-2 rounded-full transition-all"
                    style={{ width: `${treatment.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
