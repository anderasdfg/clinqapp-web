// src/components/layout/Sidebar.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Stethoscope,
  CreditCard,
  BarChart3,
  Settings,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Logo } from '../ui/logo';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Pacientes',
    href: '/dashboard/pacientes',
    icon: Users,
  },
  {
    name: 'Agenda',
    href: '/dashboard/agenda',
    icon: Calendar,
  },
  {
    name: 'Tratamientos',
    href: '/dashboard/tratamientos',
    icon: Stethoscope,
  },
  {
    name: 'Pagos',
    href: '/dashboard/pagos',
    icon: CreditCard,
  },
  {
    name: 'Reportes',
    href: '/dashboard/reportes',
    icon: BarChart3,
  },
  {
    name: 'Configuración',
    href: '/dashboard/configuracion',
    icon: Settings,
  },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-screen w-64 bg-clinq-purple-900 border-r border-clinq-cyan-500/20',
          'transition-transform duration-300 ease-in-out',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-clinq-cyan-500/20">
            <Logo href="/dashboard" />

            {/* Close button for mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors',
                    'text-sm font-medium',
                    isActive
                      ? 'bg-clinq-cyan-500/10 text-clinq-cyan-400 border border-clinq-cyan-500/20'
                      : 'text-white/70 hover:bg-clinq-purple-800/50 hover:text-white'
                  )}
                  onClick={() => {
                    // Close sidebar on mobile after navigation
                    if (window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer - Plan Badge */}
          <div className="p-4 border-t border-clinq-cyan-500/20">
            <div className="bg-gradient-to-br from-clinq-cyan-500/10 to-clinq-purple-500/10 rounded-lg p-4 border border-clinq-cyan-500/20">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-6 h-6 bg-gradient-to-br from-clinq-cyan-500 to-clinq-purple-500 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">⭐</span>
                </div>
                <span className="text-white font-semibold text-sm">Plan Pro</span>
              </div>
              <p className="text-white/60 text-xs mb-3">
                Acceso completo a todas las funciones
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-transparent border-clinq-cyan-500/30 text-clinq-cyan-400 hover:bg-clinq-cyan-500/10"
              >
                Actualizar plan
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
