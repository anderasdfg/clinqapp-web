// Tipos para la gestión de módulos habilitados por organización

export interface OrganizationModules {
  // Módulos principales
  patients: boolean;
  agenda: boolean;
  medicalRecords: boolean;
  
  // Módulos de gestión
  staff: boolean;
  services: boolean;
  sales: boolean;
  
  // Módulos de inventario
  inventory: boolean;
  productSales: boolean;
}

export const DEFAULT_MODULES: OrganizationModules = {
  // Módulos principales habilitados por defecto
  patients: true,
  agenda: true,
  medicalRecords: true,
  
  // Módulos de gestión habilitados por defecto
  staff: true,
  services: true,
  sales: true,
  
  // Módulos de inventario deshabilitados por defecto
  inventory: false,
  productSales: false,
};

export interface ModuleInfo {
  id: keyof OrganizationModules;
  name: string;
  description: string;
  category: 'main' | 'management' | 'inventory';
  icon: string;
  requiresMigration?: boolean; // Si requiere migración de BD
}

export const AVAILABLE_MODULES: ModuleInfo[] = [
  // Módulos principales
  {
    id: 'patients',
    name: 'Pacientes',
    description: 'Gestión de pacientes y sus datos',
    category: 'main',
    icon: 'users',
  },
  {
    id: 'agenda',
    name: 'Agenda',
    description: 'Calendario de citas y programación',
    category: 'main',
    icon: 'calendar',
  },
  {
    id: 'medicalRecords',
    name: 'Historia Clínica',
    description: 'Registros médicos y tratamientos',
    category: 'main',
    icon: 'clipboard',
  },
  
  // Módulos de gestión
  {
    id: 'staff',
    name: 'Personal',
    description: 'Gestión de profesionales y equipo',
    category: 'management',
    icon: 'user-group',
  },
  {
    id: 'services',
    name: 'Servicios',
    description: 'Catálogo de servicios ofrecidos',
    category: 'management',
    icon: 'clipboard-list',
  },
  {
    id: 'sales',
    name: 'Ventas',
    description: 'Registro de ventas de servicios',
    category: 'management',
    icon: 'currency-dollar',
  },
  
  // Módulos de inventario
  {
    id: 'inventory',
    name: 'Inventario',
    description: 'Control de productos y stock',
    category: 'inventory',
    icon: 'box',
    requiresMigration: true,
  },
  {
    id: 'productSales',
    name: 'Venta de Productos',
    description: 'Registro de ventas de productos',
    category: 'inventory',
    icon: 'shopping-cart',
    requiresMigration: true,
  },
];

export const MODULE_CATEGORIES = {
  main: {
    label: 'Módulos Principales',
    description: 'Funcionalidades esenciales del sistema',
  },
  management: {
    label: 'Gestión',
    description: 'Administración de recursos y ventas',
  },
  inventory: {
    label: 'Inventario & Productos',
    description: 'Control de inventario y ventas de productos',
  },
} as const;
