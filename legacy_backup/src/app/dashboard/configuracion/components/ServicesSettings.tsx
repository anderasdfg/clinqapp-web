// src/app/dashboard/configuracion/components/ServicesSettings.tsx
'use client';

import * as React from 'react';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface Service {
  id: string;
  name: string;
  description?: string | null;
  category: 'DIAGNOSTIC' | 'TREATMENT' | 'FOLLOWUP' | 'OTHER';
  basePrice: number;
  currency: string;
  duration: number;
  requiresSessions: boolean;
  defaultSessions?: number | null;
  isActive: boolean;
}

const CATEGORIES = {
  DIAGNOSTIC: 'Diagnóstico',
  TREATMENT: 'Tratamiento',
  FOLLOWUP: 'Seguimiento',
  OTHER: 'Otro',
};

export function ServicesSettings() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [services, setServices] = React.useState<Service[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingService, setEditingService] = React.useState<Service | null>(null);

  const loadServices = async () => {
    try {
      const response = await fetch('/api/services');
      if (!response.ok) throw new Error('Error al cargar servicios');
      const data = await response.json();
      setServices(data.services);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar los servicios');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadServices();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este servicio?')) return;

    try {
      const response = await fetch(`/api/services/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Error al eliminar');
      toast.success('Servicio eliminado');
      loadServices();
    } catch (error) {
      toast.error('Error al eliminar el servicio');
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Servicios y tratamientos</h2>
          <p className="text-sm text-gray-500 mt-1">
            Administra los servicios que ofreces
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => setEditingService(null)}
              className="bg-clinq-cyan-500 hover:bg-clinq-cyan-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar servicio
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingService ? 'Editar servicio' : 'Nuevo servicio'}
              </DialogTitle>
            </DialogHeader>
            <ServiceForm
              service={editingService}
              onSuccess={() => {
                setIsDialogOpen(false);
                loadServices();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {services.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>No hay servicios configurados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((service) => (
            <div
              key={service.id}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-medium text-gray-900">{service.name}</h3>
                  <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
                    {CATEGORIES[service.category]}
                  </span>
                  {!service.isActive && (
                    <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-600">
                      Inactivo
                    </span>
                  )}
                </div>
                {service.description && (
                  <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                )}
                <div className="flex gap-4 mt-2 text-sm text-gray-600">
                  <span>
                    S/ {service.basePrice}
                  </span>
                  <span>{service.duration} min</span>
                  {service.requiresSessions && (
                    <span>{service.defaultSessions} sesiones</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setEditingService(service);
                    setIsDialogOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(service.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ServiceForm({
  service,
  onSuccess,
}: {
  service: Service | null;
  onSuccess: () => void;
}) {
  const [isSaving, setIsSaving] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: service?.name || '',
    description: service?.description || '',
    category: service?.category || 'TREATMENT',
    basePrice: service?.basePrice || 0,
    duration: service?.duration || 30,
    requiresSessions: service?.requiresSessions || false,
    defaultSessions: service?.defaultSessions || 1,
    isActive: service?.isActive ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const url = service ? `/api/services/${service.id}` : '/api/services';
      const method = service ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, currency: 'PEN' }),
      });

      if (!response.ok) throw new Error('Error al guardar');

      toast.success(service ? 'Servicio actualizado' : 'Servicio creado');
      onSuccess();
    } catch (error) {
      toast.error('Error al guardar el servicio');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Nombre *</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <Label>Descripción</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Categoría *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value as Service['category'] })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CATEGORIES).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Precio (S/) *</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.basePrice}
            onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) })}
            required
          />
        </div>

        <div>
          <Label>Duración (min) *</Label>
          <Input
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
            required
          />
        </div>

        {formData.requiresSessions && (
          <div>
            <Label>Sesiones predeterminadas</Label>
            <Input
              type="number"
              value={formData.defaultSessions}
              onChange={(e) => setFormData({ ...formData, defaultSessions: parseInt(e.target.value) })}
            />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label>Requiere múltiples sesiones</Label>
        </div>
        <Switch
          checked={formData.requiresSessions}
          onCheckedChange={(checked) => setFormData({ ...formData, requiresSessions: checked })}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label>Servicio activo</Label>
        </div>
        <Switch
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isSaving} className="bg-clinq-cyan-500 hover:bg-clinq-cyan-600">
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {service ? 'Actualizar' : 'Crear servicio'}
        </Button>
      </div>
    </form>
  );
}
