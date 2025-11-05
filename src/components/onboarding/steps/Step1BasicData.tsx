// src/components/onboarding/steps/Step1BasicData.tsx
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StepWrapper } from '../StepWrapper';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUpload } from '../FileUpload';
import { toast } from 'sonner';

export function Step1BasicData() {
  const { basicData, setBasicData } = useOnboardingStore();

  const form = useForm({
    resolver: zodResolver(basicClinicDataSchema),
    defaultValues: {
      name: basicData?.name || '',
      ruc: basicData?.ruc || '',
      address: basicData?.address || '',
      phone: basicData?.phone || '',
      email: basicData?.email || '',
      logoUrl: basicData?.logoUrl || null,
      specialty: (basicData?.specialty || 'PODIATRY') as 'PODIATRY' | 'DENTISTRY' | 'AESTHETICS' | 'GENERAL',
      website: basicData?.website || '',
      instagramUrl: basicData?.instagramUrl || '',
      facebookUrl: basicData?.facebookUrl || '',
      tiktokUrl: basicData?.tiktokUrl || '',
      linkedinUrl: basicData?.linkedinUrl || '',
    },
  });

  const onNext = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      toast.error('Por favor completa todos los campos obligatorios');
      return false;
    }

    const data = form.getValues();
    setBasicData(data);
    return true;
  };

  return (
    <StepWrapper onNext={onNext} showBack={false}>
      <Form {...form}>
        <form className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Información básica del consultorio
            </h3>

            <div className="space-y-4">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">
                      Nombre del consultorio *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Consultorio Podológico San Juan"
                        className="bg-clinq-purple-800/50 border-clinq-cyan-500/30 text-white placeholder:text-white/40"
                        {...field}
                      />
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
                    <FormLabel className="text-white">RUC *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="12345678901"
                        maxLength={11}
                        className="bg-clinq-purple-800/50 border-clinq-cyan-500/30 text-white placeholder:text-white/40"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-white/60">
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
                    <FormLabel className="text-white">Dirección *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Av. Principal 123, Lima"
                        className="bg-clinq-purple-800/50 border-clinq-cyan-500/30 text-white placeholder:text-white/40"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone and Email in a row */}
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Teléfono *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+51 999 999 999"
                          className="bg-clinq-purple-800/50 border-clinq-cyan-500/30 text-white placeholder:text-white/40"
                          {...field}
                        />
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
                      <FormLabel className="text-white">Email *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="contacto@consultorio.com"
                          className="bg-clinq-purple-800/50 border-clinq-cyan-500/30 text-white placeholder:text-white/40"
                          {...field}
                        />
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
                    <FormLabel className="text-white">
                      Especialidad principal
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-clinq-purple-800/50 border-clinq-cyan-500/30 text-white">
                          <SelectValue placeholder="Selecciona una especialidad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-clinq-purple-900 border-clinq-cyan-500/30">
                        <SelectItem value="PODIATRY" className="text-white">
                          Podología
                        </SelectItem>
                        <SelectItem value="DENTISTRY" className="text-white">
                          Odontología
                        </SelectItem>
                        <SelectItem value="AESTHETICS" className="text-white">
                          Estética
                        </SelectItem>
                        <SelectItem value="GENERAL" className="text-white">
                          Medicina General
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Logo Upload */}
              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">
                      Logo (opcional)
                    </FormLabel>
                    <FormControl>
                      <FileUpload
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormDescription className="text-white/60">
                      Sube el logo de tu consultorio. Máximo 2MB.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Divider */}
              <div className="pt-4">
                <h4 className="text-md font-semibold text-white mb-4">
                  Web y Redes sociales
                </h4>
              </div>

              {/* Website */}
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Sitio web</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://www.tuconsultorio.com"
                        className="bg-clinq-purple-800/50 border-clinq-cyan-500/30 text-white placeholder:text-white/40"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Social Media in a grid */}
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="instagramUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Instagram</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://instagram.com/tu_consultorio"
                          className="bg-clinq-purple-800/50 border-clinq-cyan-500/30 text-white placeholder:text-white/40"
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
                      <FormLabel className="text-white">Facebook</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://facebook.com/tuconsultorio"
                          className="bg-clinq-purple-800/50 border-clinq-cyan-500/30 text-white placeholder:text-white/40"
                          {...field}
                        />
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
                      <FormLabel className="text-white">TikTok</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://tiktok.com/@tu_consultorio"
                          className="bg-clinq-purple-800/50 border-clinq-cyan-500/30 text-white placeholder:text-white/40"
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
                      <FormLabel className="text-white">LinkedIn</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://linkedin.com/company/tu-consultorio"
                          className="bg-clinq-purple-800/50 border-clinq-cyan-500/30 text-white placeholder:text-white/40"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </form>
      </Form>
    </StepWrapper>
  );
}
