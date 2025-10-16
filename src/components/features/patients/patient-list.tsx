// src/components/features/patients/patient-list.tsx
'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { MoreHorizontal, Phone, Mail, Calendar } from 'lucide-react'

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

interface Patient {
    id: string
    firstName: string
    lastName: string
    dni: string | null
    phone: string
    email: string | null
    createdAt: Date
    assignedProfessional: {
        firstName: string
        lastName: string
    } | null
    _count: {
        appointments: number
        treatments: number
    }
}

interface PatientListProps {
    patients: Patient[]
}

export function PatientList({ patients }: PatientListProps) {
    if (patients.length === 0) {
        return (
            <Card>
                <CardContent className="py-10 text-center">
                    <p className="text-muted-foreground">No se encontraron pacientes</p>
                    <Button asChild className="mt-4">
                        <Link href="/patients/new">Crear Primer Paciente</Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {patients.map((patient) => (
                <Card key={patient.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10">
                                <AvatarFallback>
                                    {patient.firstName[0]}
                                    {patient.lastName[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <CardTitle className="text-base">
                                    <Link
                                        href={`/patients/${patient.id}`}
                                        className="hover:underline"
                                    >
                                        {patient.firstName} {patient.lastName}
                                    </Link>
                                </CardTitle>
                                {patient.dni && (
                                    <CardDescription className="text-xs">
                                        DNI: {patient.dni}
                                    </CardDescription>
                                )}
                            </div>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href={`/patients/${patient.id}`}>Ver Detalles</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={`/patients/${patient.id}/edit`}>Editar</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={`/appointments/new?patientId=${patient.id}`}>
                                        Nueva Cita
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3.5 w-3.5" />
                            <span>{patient.phone}</span>
                        </div>
                        {patient.email && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-3.5 w-3.5" />
                                <span className="truncate">{patient.email}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>
                                Registrado {format(new Date(patient.createdAt), 'PP', { locale: es })}
                            </span>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Badge variant="secondary">
                                {patient._count.appointments} citas
                            </Badge>
                            <Badge variant="secondary">
                                {patient._count.treatments} tratamientos
                            </Badge>
                        </div>

                        {patient.assignedProfessional && (
                            <p className="text-xs text-muted-foreground">
                                Atendido por: {patient.assignedProfessional.firstName}{' '}
                                {patient.assignedProfessional.lastName}
                            </p>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}