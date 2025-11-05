// src/app/dashboard/configuracion/components/TeamSettings.tsx
'use client';

import * as React from 'react';
import { Users, Loader2, Mail } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function TeamSettings() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [role, setRole] = React.useState('PROFESSIONAL');
  const [isSending, setIsSending] = React.useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    try {
      // TODO: Implement API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success(`Invitación enviada a ${email}`);
      setEmail('');
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Error al enviar invitación');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Equipo</h2>
          <p className="text-sm text-gray-500 mt-1">
            Administra los miembros de tu equipo e invitaciones
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-clinq-cyan-500 hover:bg-clinq-cyan-600">
              <Mail className="h-4 w-4 mr-2" />
              Invitar miembro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invitar miembro del equipo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  placeholder="email@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label>Rol *</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PROFESSIONAL">Profesional</SelectItem>
                    <SelectItem value="RECEPTIONIST">Recepcionista</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSending}
                  className="bg-clinq-cyan-500 hover:bg-clinq-cyan-600"
                >
                  {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Enviar invitación
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <Users className="h-16 w-16 mb-4" />
        <p className="text-lg font-medium">Sin miembros de equipo</p>
        <p className="text-sm">Invita a personas para que colaboren contigo</p>
      </div>
    </div>
  );
}
