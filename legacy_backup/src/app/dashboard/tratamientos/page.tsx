// src/app/dashboard/tratamientos/page.tsx
import * as React from 'react';
import { Stethoscope } from 'lucide-react';

export default function TratamientosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tratamientos</h1>
        <p className="text-gray-600 mt-1">Gestiona los tratamientos de tus pacientes</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
        <div className="flex flex-col items-center justify-center text-gray-400">
          <Stethoscope className="h-20 w-20 mb-4" />
          <p className="text-xl font-medium">Gestión de Tratamientos</p>
          <p className="text-sm">Esta sección está en desarrollo</p>
        </div>
      </div>
    </div>
  );
}
