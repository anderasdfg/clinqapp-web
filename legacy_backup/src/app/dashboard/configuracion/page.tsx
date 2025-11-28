// src/app/dashboard/configuracion/page.tsx
'use client';

import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GeneralSettings } from './components/GeneralSettings';
import { ScheduleSettings } from './components/ScheduleSettings';
import { PaymentMethodsSettings } from './components/PaymentMethodsSettings';
import { ConsultationTypesSettings } from './components/ConsultationTypesSettings';
import { ServicesSettings } from './components/ServicesSettings';
import { AgendaSettings } from './components/AgendaSettings';
import { NotificationsSettings } from './components/NotificationsSettings';
import { TeamSettings } from './components/TeamSettings';

export default function ConfiguracionPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600 mt-1">
          Administra la configuración de tu consultorio
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 h-auto bg-transparent p-0">
          <TabsTrigger
            value="general"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            General
          </TabsTrigger>
          <TabsTrigger
            value="horarios"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Horarios
          </TabsTrigger>
          <TabsTrigger
            value="pagos"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Métodos de pago
          </TabsTrigger>
          <TabsTrigger
            value="consultas"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Tipos de consulta
          </TabsTrigger>
          <TabsTrigger
            value="servicios"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Servicios
          </TabsTrigger>
          <TabsTrigger
            value="agenda"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Agenda
          </TabsTrigger>
          <TabsTrigger
            value="notificaciones"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Notificaciones
          </TabsTrigger>
          <TabsTrigger
            value="equipo"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Equipo
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="general">
            <GeneralSettings />
          </TabsContent>

          <TabsContent value="horarios">
            <ScheduleSettings />
          </TabsContent>

          <TabsContent value="pagos">
            <PaymentMethodsSettings />
          </TabsContent>

          <TabsContent value="consultas">
            <ConsultationTypesSettings />
          </TabsContent>

          <TabsContent value="servicios">
            <ServicesSettings />
          </TabsContent>

          <TabsContent value="agenda">
            <AgendaSettings />
          </TabsContent>

          <TabsContent value="notificaciones">
            <NotificationsSettings />
          </TabsContent>

          <TabsContent value="equipo">
            <TeamSettings />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
