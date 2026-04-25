import { useEffect, useState } from 'react';
import { OrganizationModules, DEFAULT_MODULES } from '@/types/modules.types';
import { organizationService } from '@/services/organization.service';

/**
 * Hook para obtener los módulos habilitados de la organización actual
 */
export function useEnabledModules(): OrganizationModules {
  const [enabledModules, setEnabledModules] = useState<OrganizationModules>(DEFAULT_MODULES);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        console.log('🔄 useEnabledModules - Fetching modules...');
        const modules = await organizationService.getEnabledModules();
        console.log('✅ useEnabledModules - Modules fetched:', modules);
        setEnabledModules(modules || DEFAULT_MODULES);
      } catch (error) {
        console.error('❌ Error fetching enabled modules:', error);
        // En caso de error, usar módulos por defecto
        setEnabledModules(DEFAULT_MODULES);
      }
    };
    
    // Solo cargar al montar el componente (login)
    fetchModules();
  }, []);

  return enabledModules;
}

/**
 * Hook para verificar si un módulo específico está habilitado
 */
export function useIsModuleEnabled(moduleId: keyof OrganizationModules): boolean {
  const enabledModules = useEnabledModules();
  return enabledModules[moduleId];
}
