// src/app/dashboard/reportes/page.tsx
import * as React from 'react';
import { BarChart3 } from 'lucide-react';

export default function ReportesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
        <p className="text-gray-600 mt-1">Analiza estadísticas y genera reportes</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
        <div className="flex flex-col items-center justify-center text-gray-400">
          <BarChart3 className="h-20 w-20 mb-4" />
          <p className="text-xl font-medium">Reportes y Estadísticas</p>
          <p className="text-sm">Esta sección está en desarrollo</p>
        </div>
      </div>
    </div>
  );
}
