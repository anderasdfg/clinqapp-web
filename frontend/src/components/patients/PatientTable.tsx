import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PatientTableRow } from './PatientTableRow';
import { Users } from 'lucide-react';

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

interface PatientTableProps {
  patients: Patient[];
  isLoading: boolean;
  onDelete: (id: string) => void;
}

export function PatientTable({ patients, isLoading, onDelete }: PatientTableProps) {
  if (isLoading && patients.length === 0) {
    return (
      <div className="rounded-lg border border-[rgb(var(--border-primary))]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Paciente</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Fecha de Nacimiento</TableHead>
              <TableHead>Profesional Asignado</TableHead>
              <TableHead>Fuente de Referencia</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                <td className="p-4" colSpan={6}>
                  <div className="flex items-center gap-3 animate-pulse">
                    <div className="h-10 w-10 rounded-full bg-muted" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-32 bg-muted rounded" />
                      <div className="h-3 w-24 bg-muted rounded" />
                    </div>
                  </div>
                </td>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="rounded-lg border border-[rgb(var(--border-primary))] p-12">
        <div className="flex flex-col items-center justify-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="max-w-sm space-y-1">
            <p className="font-semibold text-[rgb(var(--text-primary))]">
              No se encontraron pacientes
            </p>
            <p className="text-sm text-[rgb(var(--text-secondary))]">
              Intenta ajustar los filtros o crea un nuevo paciente
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[rgb(var(--border-primary))]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Paciente</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead>Fecha de Nacimiento</TableHead>
            <TableHead>Profesional Asignado</TableHead>
            <TableHead>Fuente de Referencia</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => (
            <PatientTableRow
              key={patient.id}
              patient={patient}
              onDelete={onDelete}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
