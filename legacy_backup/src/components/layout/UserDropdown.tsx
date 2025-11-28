// src/components/layout/UserDropdown.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { User, Settings, HelpCircle, LogOut, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string | null;
  organization: {
    name: string;
  };
}

export function UserDropdown() {
  const router = useRouter();
  const [userData, setUserData] = React.useState<UserData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadUserData = async () => {
      try {
        const response = await fetch('/api/user/me');

        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login');
          }
          throw new Error('Error al cargar datos del usuario');
        }

        const data = await response.json();
        setUserData({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          avatarUrl: data.avatarUrl,
          organization: {
            name: data.organization?.name || 'Mi Consultorio',
          },
        });
      } catch (error) {
        console.error('Error loading user data:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [router]);

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      toast.success('Sesión cerrada exitosamente');
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  if (isLoading || !userData) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
      </div>
    );
  }

  const initials = `${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center space-x-3 focus:outline-none">
        <Avatar className="h-8 w-8">
          <AvatarImage src={userData.avatarUrl || undefined} alt={userData.firstName} />
          <AvatarFallback className="bg-clinq-cyan-500 text-white text-sm font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-900">
            {userData.firstName} {userData.lastName}
          </p>
          <p className="text-xs text-gray-500 truncate max-w-[150px]">
            {userData.organization.name}
          </p>
        </div>
        <ChevronDown className="h-4 w-4 text-gray-400 hidden md:block" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div>
            <p className="font-medium">
              {userData.firstName} {userData.lastName}
            </p>
            <p className="text-xs font-normal text-gray-500">{userData.email}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => router.push('/dashboard/perfil')}>
          <User className="mr-2 h-4 w-4" />
          <span>Mi perfil</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => router.push('/dashboard/configuracion')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Configuración</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => router.push('/dashboard/ayuda')}>
          <HelpCircle className="mr-2 h-4 w-4" />
          <span>Ayuda</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
