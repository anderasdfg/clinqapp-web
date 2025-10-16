// src/app/(dashboard)/patients/page.tsx
import { Suspense } from 'react'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getPatients } from '@/lib/actions/patients'
import { PatientList } from '@/components/features/patients/patient-list'

export default async function PatientsPage({
    searchParams,
}: {
    searchParams: { search?: string }
}) {
    const result = await getPatients(searchParams.search)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Pacientes</h1>
                    <p className="text-muted-foreground">
                        Gestiona la información de tus pacientes
                    </p>
                </div>
                <Button asChild>
                    <Link href="/patients/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo Paciente
                    </Link>
                </Button>
            </div>

            {/* Search */}
            <Card>
                <CardHeader>
                    <CardTitle>Buscar Pacientes</CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                name="search"
                                placeholder="Buscar por nombre, DNI, teléfono o email..."
                                className="pl-8"
                                defaultValue={searchParams.search}
                            />
                        </div>
                        <Button type="submit">Buscar</Button>
                    </form>
                </CardContent>
            </Card>

            {/* Patient List */}
            <Suspense fallback={<div>Cargando pacientes...</div>}>
                {result.success ? (
                    <PatientList patients={result.data} />
                ) : (
                    <Card>
                        <CardContent className="py-10 text-center">
                            <p className="text-muted-foreground">Error al cargar pacientes</p>
                        </CardContent>
                    </Card>
                )}
            </Suspense>
        </div>
    )
}