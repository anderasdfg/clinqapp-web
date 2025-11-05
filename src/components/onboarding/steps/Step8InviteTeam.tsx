// src/components/onboarding/steps/Step8InviteTeam.tsx
'use client';

import * as React from 'react';
import { StepWrapper } from '../StepWrapper';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { type Invitation } from '@/lib/validations/onboarding';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, UserPlus, Stethoscope, ClipboardList, UserCog } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const ROLE_OPTIONS = [
  {
    value: 'PROFESSIONAL',
    label: 'Médico/Profesional',
    description: 'Puede atender pacientes y gestionar su agenda',
    icon: Stethoscope,
    color: 'text-clinq-cyan-500',
  },
  {
    value: 'RECEPTIONIST',
    label: 'Recepcionista',
    description: 'Puede gestionar citas y pacientes',
    icon: ClipboardList,
    color: 'text-clinq-magenta-500',
  },
  {
    value: 'OWNER',
    label: 'Administrador',
    description: 'Acceso completo al consultorio',
    icon: UserCog,
    color: 'text-yellow-500',
  },
];

export function Step8InviteTeam() {
  const { invitations, setInvitations } = useOnboardingStore();

  const [invitationList, setInvitationList] = React.useState<Invitation[]>(
    invitations?.invitations || []
  );

  const [email, setEmail] = React.useState('');
  const [role, setRole] = React.useState<'PROFESSIONAL' | 'RECEPTIONIST' | 'OWNER'>(
    'PROFESSIONAL'
  );

  const handleAddInvitation = () => {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Por favor ingresa un email válido');
      return;
    }

    // Check if email already exists
    if (invitationList.some((inv) => inv.email === email)) {
      toast.error('Ya has agregado este email');
      return;
    }

    const newInvitation: Invitation = {
      email,
      role,
    };

    setInvitationList([...invitationList, newInvitation]);
    setEmail('');
    setRole('PROFESSIONAL');
    toast.success('Invitación agregada');
  };

  const handleDeleteInvitation = (index: number) => {
    setInvitationList(invitationList.filter((_, i) => i !== index));
    toast.success('Invitación eliminada');
  };

  const onNext = () => {
    // This step is optional, so always return true
    setInvitations({ invitations: invitationList });
    return true;
  };

  const getRoleInfo = (roleValue: string) => {
    return ROLE_OPTIONS.find((r) => r.value === roleValue);
  };

  return (
    <StepWrapper onNext={onNext} nextLabel={invitationList.length === 0 ? 'Omitir este paso' : 'Continuar'}>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Invita a tu equipo
          </h3>
          <p className="text-white/60 text-sm">
            Agrega miembros a tu equipo (puedes omitir este paso y hacerlo más adelante)
          </p>
        </div>

        {/* Add invitation form */}
        <div className="glass-dark border border-clinq-cyan-500/20 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="h-5 w-5 text-clinq-cyan-500" />
            <h4 className="font-semibold text-white">Nueva invitación</h4>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-white">Email del miembro</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@email.com"
                className="mt-2 bg-clinq-purple-800/50 border-clinq-cyan-500/30 text-white placeholder:text-white/40"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddInvitation();
                  }
                }}
              />
            </div>

            <div>
              <Label className="text-white">Rol</Label>
              <Select
                value={role}
                onValueChange={(value: 'PROFESSIONAL' | 'RECEPTIONIST' | 'OWNER') => setRole(value)}
              >
                <SelectTrigger className="mt-2 bg-clinq-purple-800/50 border-clinq-cyan-500/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-clinq-purple-900 border-clinq-cyan-500/30">
                  {ROLE_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    return (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="text-white"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={cn('h-4 w-4', option.color)} />
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-white/60">
                              {option.description}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="button"
              onClick={handleAddInvitation}
              className="w-full bg-clinq-gradient"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar invitación
            </Button>
          </div>
        </div>

        {/* Invitations list */}
        {invitationList.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-white">
              Invitaciones pendientes ({invitationList.length})
            </h4>

            {invitationList.map((invitation, index) => {
              const roleInfo = getRoleInfo(invitation.role);
              const Icon = roleInfo?.icon || UserPlus;

              return (
                <div
                  key={index}
                  className="glass-dark border border-clinq-cyan-500/20 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn('p-2 bg-clinq-purple-800 rounded', roleInfo?.color)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {invitation.email}
                        </p>
                        <p className="text-sm text-white/60">
                          {roleInfo?.label}
                        </p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteInvitation(index)}
                      className="text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {invitationList.length === 0 && (
          <div className="text-center py-12 glass-dark border border-clinq-cyan-500/20 rounded-lg">
            <UserPlus className="h-12 w-12 text-white/40 mx-auto mb-3" />
            <p className="text-white/60 mb-2">
              No has agregado invitaciones aún
            </p>
            <p className="text-white/40 text-sm">
              Puedes omitir este paso e invitar a tu equipo más adelante desde la configuración
            </p>
          </div>
        )}
      </div>
    </StepWrapper>
  );
}
