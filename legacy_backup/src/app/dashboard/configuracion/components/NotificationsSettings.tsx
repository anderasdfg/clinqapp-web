// src/app/dashboard/configuracion/components/NotificationsSettings.tsx
'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface NotificationsData {
  notificationEmail: boolean;
  notificationWhatsapp: boolean;
  whatsappNumber: string | null;
  sendReminders: boolean;
  reminderHoursBefore: number;
}

export function NotificationsSettings() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [data, setData] = React.useState<NotificationsData>({
    notificationEmail: true,
    notificationWhatsapp: false,
    whatsappNumber: null,
    sendReminders: true,
    reminderHoursBefore: 24,
  });

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/api/organization/notifications');
        if (!response.ok) throw new Error('Error al cargar configuración');

        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error loading notifications:', error);
        toast.error('Error al cargar la configuración de notificaciones');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/organization/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al guardar');
      }

      toast.success('Configuración de notificaciones guardada exitosamente');
    } catch (error) {
      console.error('Error saving notifications:', error);
      toast.error(
        error instanceof Error ? error.message : 'Error al guardar la configuración'
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-clinq-cyan-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Notificaciones</h2>
        <p className="text-sm text-gray-500 mt-1">
          Configura las notificaciones y recordatorios automáticos
        </p>
      </div>

      <div className="space-y-6">
        {/* Email Notifications */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
          <div className="space-y-1">
            <Label className="text-base font-medium">Notificaciones por Email</Label>
            <p className="text-sm text-gray-500">
              Recibe notificaciones de citas y recordatorios por email
            </p>
          </div>
          <Switch
            checked={data.notificationEmail}
            onCheckedChange={(checked) =>
              setData((prev) => ({ ...prev, notificationEmail: checked }))
            }
          />
        </div>

        {/* WhatsApp Notifications */}
        <div className="space-y-4 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium">Notificaciones por WhatsApp</Label>
              <p className="text-sm text-gray-500">
                Envía recordatorios a tus pacientes por WhatsApp
              </p>
            </div>
            <Switch
              checked={data.notificationWhatsapp}
              onCheckedChange={(checked) =>
                setData((prev) => ({ ...prev, notificationWhatsapp: checked }))
              }
            />
          </div>

          {data.notificationWhatsapp && (
            <div>
              <Label>Número de WhatsApp Business</Label>
              <Input
                type="tel"
                placeholder="+51 999 999 999"
                value={data.whatsappNumber || ''}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, whatsappNumber: e.target.value }))
                }
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Este número se usará para enviar notificaciones automáticas
              </p>
            </div>
          )}
        </div>

        {/* Reminders */}
        <div className="space-y-4 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium">Recordatorios Automáticos</Label>
              <p className="text-sm text-gray-500">
                Envía recordatorios automáticos a tus pacientes antes de sus citas
              </p>
            </div>
            <Switch
              checked={data.sendReminders}
              onCheckedChange={(checked) =>
                setData((prev) => ({ ...prev, sendReminders: checked }))
              }
            />
          </div>

          {data.sendReminders && (
            <div>
              <Label>Enviar recordatorio con cuántas horas de anticipación</Label>
              <Select
                value={data.reminderHoursBefore.toString()}
                onValueChange={(value) =>
                  setData((prev) => ({
                    ...prev,
                    reminderHoursBefore: parseInt(value),
                  }))
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hora antes</SelectItem>
                  <SelectItem value="2">2 horas antes</SelectItem>
                  <SelectItem value="3">3 horas antes</SelectItem>
                  <SelectItem value="6">6 horas antes</SelectItem>
                  <SelectItem value="12">12 horas antes</SelectItem>
                  <SelectItem value="24">24 horas antes (1 día)</SelectItem>
                  <SelectItem value="48">48 horas antes (2 días)</SelectItem>
                  <SelectItem value="72">72 horas antes (3 días)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-6 border-t mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.location.reload()}
          disabled={isSaving}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          className="bg-clinq-cyan-500 hover:bg-clinq-cyan-600"
          disabled={isSaving}
        >
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Guardar configuración
        </Button>
      </div>
    </div>
  );
}
