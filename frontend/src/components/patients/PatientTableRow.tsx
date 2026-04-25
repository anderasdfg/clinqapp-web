import { Link } from 'react-router-dom';
import { TableCell, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Eye, Pencil, Trash2, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { REFERRAL_SOURCE_LABELS } from '@/types/patient.types';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dni?: string;
  phone?: string;
  email?: string;
  dateOfBirth?: string;
  referralSource?: string;
  assignedProfessional?: {
    firstName: string;
    lastName: string;
  };
}

interface PatientTableRowProps {
  patient: Patient;
  onDelete: (id: string) => void;
}

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  try {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
  } catch {
    return '-';
  }
};

export function PatientTableRow({ patient, onDelete }: PatientTableRowProps) {
  return (
    <TableRow className="hover:bg-muted/50">
      {/* Patient Info */}
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(patient.firstName, patient.lastName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-[rgb(var(--text-primary))]">
              {patient.firstName} {patient.lastName}
            </div>
            <div className="text-sm text-[rgb(var(--text-secondary))]">
              {patient.dni || 'Sin DNI'}
            </div>
          </div>
        </div>
      </TableCell>

      {/* Contact */}
      <TableCell>
        <div className="space-y-1">
          {patient.phone && (
            <div className="text-sm text-[rgb(var(--text-primary))]">
              {patient.phone}
            </div>
          )}
          {patient.email && (
            <div className="text-sm text-[rgb(var(--text-secondary))]">
              {patient.email}
            </div>
          )}
          {!patient.phone && !patient.email && (
            <span className="text-sm text-[rgb(var(--text-tertiary))]">-</span>
          )}
        </div>
      </TableCell>

      {/* Birth Date */}
      <TableCell>
        <span className="text-sm">{formatDate(patient.dateOfBirth)}</span>
      </TableCell>

      {/* Professional */}
      <TableCell>
        {patient.assignedProfessional ? (
          <Badge variant="secondary" className="font-normal">
            {patient.assignedProfessional.firstName}{' '}
            {patient.assignedProfessional.lastName}
          </Badge>
        ) : (
          <span className="text-sm text-[rgb(var(--text-tertiary))]">
            Sin asignar
          </span>
        )}
      </TableCell>

      {/* Referral Source */}
      <TableCell>
        {patient.referralSource ? (
          <Badge variant="outline" className="font-normal">
            {REFERRAL_SOURCE_LABELS[patient.referralSource as keyof typeof REFERRAL_SOURCE_LABELS] ||
              patient.referralSource}
          </Badge>
        ) : (
          <span className="text-sm text-[rgb(var(--text-tertiary))]">-</span>
        )}
      </TableCell>

      {/* Actions */}
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link
                to={`/app/dashboard/patients/${patient.id}`}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Eye className="h-4 w-4" />
                Ver detalles
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                to={`/app/dashboard/patients/${patient.id}/edit`}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Pencil className="h-4 w-4" />
                Editar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(patient.id)}
              className="text-destructive focus:text-destructive flex items-center gap-2 cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
