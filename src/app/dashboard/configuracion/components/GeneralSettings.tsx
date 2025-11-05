// src/app/dashboard/configuracion/components/GeneralSettings.tsx
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { basicClinicDataSchema } from '@/lib/validations/onboarding';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileUpload } from '@/components/onboarding/FileUpload';

export function GeneralSettings() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  const form = useForm({
    resolver: zodResolver(basicClinicDataSchema),
    defaultValues: {
      name: '',
      ruc: '',
      address: '',
      phone: '',
      email: '',
      logoUrl: null,
      specialty: 'PODIATRY' as const,
      website: '',
      instagramUrl: '',
      facebookUrl: '',
      tiktokUrl: '',
      linkedinUrl: '',
    },
  });

  // Load organization data
  React.useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/api/organization');
        if (!response.ok) throw new Error('Error al cargar datos');

        const data = await response.json();
        form.reset({
          name: data.name || '',
          ruc: data.ruc || '',
          address: data.address || '',
          phone: data.phone || '',
          email: data.email || '',
          logoUrl: data.logoUrl || null,
          specialty: data.specialty || 'PODIATRY',
          website: data.website || '',
          instagramUrl: data.instagramUrl || '',
          facebookUrl: data.facebookUrl || '',
          tiktokUrl: data.tiktokUrl || '',
          linkedinUrl: data.linkedinUrl || '',
        });
      } catch (error) {
        console.error('Error loading organization data:', error);
        toast.error('Error al cargar los datos del consultorio');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [form]);

  const onSubmit = async (data: {
    name: string;
    ruc: string;
    address: string;
    phone: string;
    email: string;
    logoUrl?: string | null;
    specialty?: 'PODIATRY' | 'DENTISTRY' | 'AESTHETICS' | 'GENERAL';
    website?: string;
    instagramUrl?: string;
    facebookUrl?: string;
    tiktokUrl?: string;
    linkedinUrl?: string;
  }) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/organization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al guardar');
      }

      toast.success('Configuración guardada exitosamente');
    } catch (error) {
      console.error('Error saving organization data:', error);
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
        <h2 className="text-xl font-semibold text-gray-900">
          Datos del consultorio
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Actualiza la información básica de tu consultorio
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
              Información básica
            </h3>

            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del consultorio *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Consultorio Podológico San Juan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* RUC */}
            <FormField
              control={form.control}
              name="ruc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RUC *</FormLabel>
                  <FormControl>
                    <Input placeholder="12345678901" maxLength={11} {...field} />
                  </FormControl>
                  <FormDescription>
                    Registro Único de Contribuyentes (11 dígitos)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección *</FormLabel>
                  <FormControl>
                    <Input placeholder="Av. Principal 123, Lima" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone and Email */}
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono *</FormLabel>
                    <FormControl>
                      <Input placeholder="+51 999 999 999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="contacto@consultorio.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Specialty */}
            <FormField
              control={form.control}
              name="specialty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Especialidad principal</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una especialidad" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PODIATRY">Podología</SelectItem>
                      <SelectItem value="DENTISTRY">Odontología</SelectItem>
                      <SelectItem value="AESTHETICS">Estética</SelectItem>
                      <SelectItem value="GENERAL">Medicina General</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Logo */}
            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo</FormLabel>
                  <FormControl>
                    <FileUpload value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormDescription>
                    Sube el logo de tu consultorio. Máximo 2MB.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Web & Social Media Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
              Web y Redes sociales
            </h3>

            {/* Website */}
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sitio web</FormLabel>
                  <FormControl>
                    <Input placeholder="https://www.tuconsultorio.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Social Media Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="instagramUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://instagram.com/tu_consultorio"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="facebookUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facebook</FormLabel>
                    <FormControl>
                      <Input placeholder="https://facebook.com/tuconsultorio" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tiktokUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>TikTok</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://tiktok.com/@tu_consultorio"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="linkedinUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://linkedin.com/company/tu-consultorio"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-clinq-cyan-500 hover:bg-clinq-cyan-600"
              disabled={isSaving}
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar cambios
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
