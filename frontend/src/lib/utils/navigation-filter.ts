import { NavigationGroup, NavigationItem } from '@/lib/constants/navigation';
import { OrganizationModules } from '@/types/modules.types';

/**
 * Mapeo de IDs de navegación a módulos
 */
const NAVIGATION_TO_MODULE_MAP: Record<string, keyof OrganizationModules> = {
  'patients': 'patients',
  'agenda': 'agenda',
  'medical-records': 'medicalRecords',
  'staff': 'staff',
  'services': 'services',
  'sales': 'sales',
  'inventory': 'inventory',
  'product_sales': 'productSales',
};

/**
 * Filtra los items de navegación según los módulos habilitados
 */
export function filterNavigationItems(
  items: NavigationItem[],
  enabledModules: OrganizationModules
): NavigationItem[] {
  console.log('🔍 filterNavigationItems - enabledModules:', enabledModules);
  console.log('🔍 filterNavigationItems - items:', items.map(i => i.id));
  
  return items.filter(item => {
    const moduleKey = NAVIGATION_TO_MODULE_MAP[item.id];
    
    // Si no está mapeado, mostrar por defecto (ej: home)
    if (!moduleKey) {
      console.log(`✅ Item ${item.id} - no mapeado, mostrar por defecto`);
      return true;
    }
    
    // Verificar si el módulo está habilitado
    const isEnabled = enabledModules[moduleKey];
    console.log(`${isEnabled ? '✅' : '❌'} Item ${item.id} -> module ${moduleKey} = ${isEnabled}`);
    return isEnabled;
  });
}

/**
 * Filtra los grupos de navegación según los módulos habilitados
 */
export function filterNavigationGroups(
  groups: NavigationGroup[],
  enabledModules: OrganizationModules
): NavigationGroup[] {
  return groups
    .map(group => ({
      ...group,
      items: filterNavigationItems(group.items, enabledModules),
    }))
    .filter(group => group.items.length > 0); // Eliminar grupos vacíos
}
