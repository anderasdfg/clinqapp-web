// src/components/onboarding/steps/Step5Services.tsx
'use client';

import * as React from 'react';
import { StepWrapper } from '../StepWrapper';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { type Service } from '@/lib/validations/onboarding';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const PODIATRY_SERVICES: Service[] = [
  { name: 'Evaluación inicial', duration: 30, basePrice: 80, category: 'DIAGNOSTIC', currency: 'PEN', description: null },
  { name: 'Uñas encarnadas', duration: 45, basePrice: 100, category: 'TREATMENT', currency: 'PEN', description: null },
  { name: 'Callosidades', duration: 30, basePrice: 70, category: 'TREATMENT', currency: 'PEN', description: null },
  { name: 'Pie diabético', duration: 60, basePrice: 150, category: 'TREATMENT', currency: 'PEN', description: null },
  { name: 'Plantillas ortopédicas', duration: 60, basePrice: 200, category: 'TREATMENT', currency: 'PEN', description: null },
  { name: 'Control de seguimiento', duration: 20, basePrice: 50, category: 'FOLLOWUP', currency: 'PEN', description: null },
];

export function Step5Services() {
  const { services, setServices } = useOnboardingStore();

  const [serviceList, setServiceList] = React.useState<Service[]>(
    services?.services || []
  );

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);

  // Form state for new/edit service
  const [formData, setFormData] = React.useState<Service>({
    name: '',
    description: null,
    category: 'OTHER',
    duration: 30,
    basePrice: null,
    currency: 'PEN',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: null,
      category: 'OTHER',
      duration: 30,
      basePrice: null,
      currency: 'PEN',
    });
    setEditingIndex(null);
  };

  const handleAddService = () => {
    if (!formData.name.trim()) {
      toast.error('El nombre del servicio es obligatorio');
      return;
    }

    if (editingIndex !== null) {
      const updated = [...serviceList];
      updated[editingIndex] = formData;
      setServiceList(updated);
      toast.success('Servicio actualizado');
    } else {
      setServiceList([...serviceList, formData]);
      toast.success('Servicio agregado');
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEditService = (index: number) => {
    setFormData(serviceList[index]);
    setEditingIndex(index);
    setIsDialogOpen(true);
  };

  const handleDeleteService = (index: number) => {
    setServiceList(serviceList.filter((_, i) => i !== index));
    toast.success('Servicio eliminado');
  };

  const handleLoadPodiatryServices = () => {
    setServiceList(PODIATRY_SERVICES);
    toast.success('Catálogo de podología cargado');
  };

  const onNext = () => {
    if (serviceList.length === 0) {
      toast.error('Debe agregar al menos un servicio');
      return false;
    }

    setServices({ services: serviceList });
    return true;
  };

  return (
    <StepWrapper onNext={onNext}>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Servicios y tratamientos
            </h3>
            <p className="text-white/60 text-sm">
              Define los servicios que ofreces en tu consultorio
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleLoadPodiatryServices}
            className="border-clinq-magenta-500/50 text-clinq-magenta-500 hover:bg-clinq-magenta-500/10"
          >
            <FileText className="h-4 w-4 mr-2" />
            Cargar catálogo de podología
          </Button>
        </div>

        {/* Services list */}
        <div className="space-y-3">
          {serviceList.map((service, index) => (
            <div
              key={index}
              className="glass-dark border border-clinq-cyan-500/20 rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{service.name}</h4>
                  {service.description && (
                    <p className="text-sm text-white/60 mt-1">
                      {service.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-white/60">
                    <span>{service.duration} min</span>
                    {service.basePrice !== null && service.basePrice !== undefined && (
                      <span>
                        {service.currency} {service.basePrice.toFixed(2)}
                      </span>
                    )}
                    <span className="px-2 py-1 bg-clinq-cyan-500/20 rounded text-clinq-cyan-500 text-xs">
                      {service.category === 'DIAGNOSTIC'
                        ? 'Diagnóstico'
                        : service.category === 'TREATMENT'
                          ? 'Tratamiento'
                          : service.category === 'FOLLOWUP'
                            ? 'Seguimiento'
                            : 'Otro'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditService(index)}
                    className="text-clinq-cyan-500 hover:bg-clinq-cyan-500/10"
                  >
                    Editar
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteService(index)}
                    className="text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {serviceList.length === 0 && (
            <div className="text-center py-12 glass-dark border border-clinq-cyan-500/20 rounded-lg">
              <p className="text-white/60">
                No has agregado servicios aún. Haz clic en el botón de abajo
                para agregar tu primer servicio.
              </p>
            </div>
          )}
        </div>

        {/* Add service button */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="w-full border-clinq-cyan-500/50 text-clinq-cyan-500 hover:bg-clinq-cyan-500/10"
              onClick={resetForm}
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar servicio
            </Button>
          </DialogTrigger>

          <DialogContent className="glass-dark border-clinq-cyan-500/30 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingIndex !== null ? 'Editar servicio' : 'Nuevo servicio'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label className="text-white py-2">Nombre del servicio *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Ej: Evaluación inicial"
                  className="bg-clinq-purple-800/50 border-clinq-cyan-500/30 text-white"
                />
              </div>

              <div>
                <Label className="text-white py-2">Descripción (opcional)</Label>
                <Input
                  value={formData.description || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value || null })
                  }
                  placeholder="Breve descripción del servicio"
                  className="bg-clinq-purple-800/50 border-clinq-cyan-500/30 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white py-2">Categoría</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: Service['category']) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger className="bg-clinq-purple-800/50 border-clinq-cyan-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-clinq-purple-900 border-clinq-cyan-500/30">
                      <SelectItem value="DIAGNOSTIC" className="text-white">
                        Diagnóstico
                      </SelectItem>
                      <SelectItem value="TREATMENT" className="text-white">
                        Tratamiento
                      </SelectItem>
                      <SelectItem value="FOLLOWUP" className="text-white">
                        Seguimiento
                      </SelectItem>
                      <SelectItem value="OTHER" className="text-white">
                        Otro
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white py-2">Duración (minutos) *</Label>
                  <Input
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration: parseInt(e.target.value) || 0,
                      })
                    }
                    min={5}
                    max={480}
                    className="bg-clinq-purple-800/50 border-clinq-cyan-500/30 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Label className="text-white py-2">Precio (opcional)</Label>
                  <Input
                    type="number"
                    value={formData.basePrice ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        basePrice: e.target.value ? parseFloat(e.target.value) : null,
                      })
                    }
                    min={0}
                    step={0.01}
                    placeholder="0.00"
                    className="bg-clinq-purple-800/50 border-clinq-cyan-500/30 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white py-2">Moneda</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value: Service['currency']) =>
                      setFormData({ ...formData, currency: value })
                    }
                  >
                    <SelectTrigger className="bg-clinq-purple-800/50 border-clinq-cyan-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-clinq-purple-900 border-clinq-cyan-500/30">
                      <SelectItem value="PEN" className="text-white">
                        PEN
                      </SelectItem>
                      <SelectItem value="USD" className="text-white">
                        USD
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setIsDialogOpen(false);
                  }}
                  className="border-clinq-cyan-500/50 text-white bg-clinq-cyan-500"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleAddService}
                  className="bg-clinq-gradient"
                >
                  {editingIndex !== null ? 'Guardar cambios' : 'Agregar servicio'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </StepWrapper>
  );
}
