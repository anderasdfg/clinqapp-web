import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
//import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Info, Save } from 'lucide-react';
import { 
  OrganizationModules, 
  AVAILABLE_MODULES, 
  MODULE_CATEGORIES,
  DEFAULT_MODULES 
} from '@/types/modules.types';
import { toast } from 'sonner';

interface ModulePermissionsManagerProps {
  organizationId: string;
  organizationName: string;
  currentModules?: OrganizationModules | null;
  onSave: (modules: OrganizationModules) => Promise<void>;
}

export function ModulePermissionsManager({
  //organizationId,
  organizationName,
  currentModules,
  onSave,
}: ModulePermissionsManagerProps) {
  const [modules, setModules] = useState<OrganizationModules>(
    currentModules || DEFAULT_MODULES
  );
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Actualizar modules cuando cambien los currentModules
  useEffect(() => {
    console.log('🟡 ModulePermissionsManager - currentModules cambió:', currentModules);
    setModules(currentModules || DEFAULT_MODULES);
    setHasChanges(false);
  }, [JSON.stringify(currentModules)]);

  const handleToggleModule = (moduleId: keyof OrganizationModules) => {
    setModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(modules);
      toast.success('Módulos actualizados correctamente');
      setHasChanges(false);
    } catch (error) {
      toast.error('Error al actualizar módulos');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setModules(currentModules || DEFAULT_MODULES);
    setHasChanges(false);
  };

  const getModulesByCategory = (category: 'main' | 'management' | 'inventory') => {
    return AVAILABLE_MODULES.filter(module => module.category === category);
  };

  const renderIcon = (iconName: string) => {
    // Aquí puedes usar los mismos iconos que en navigation.ts
    return <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
      {iconName.charAt(0).toUpperCase()}
    </div>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">Permisos de Módulos</h3>
          <p className="text-sm text-muted-foreground">
            Configura qué módulos están disponibles para <strong>{organizationName}</strong>
          </p>
        </div>
        {hasChanges && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        )}
      </div>

      {/* Info message */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-2 text-sm text-blue-700">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>
              Los módulos deshabilitados no aparecerán en el menú de navegación para los usuarios de esta organización.
              Los cambios se aplicarán inmediatamente después de guardar.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Modules by category */}
      {(['main', 'management', 'inventory'] as const).map(category => {
        const categoryModules = getModulesByCategory(category);
        const categoryInfo = MODULE_CATEGORIES[category];

        return (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-base">{categoryInfo.label}</CardTitle>
              <CardDescription>{categoryInfo.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryModules.map(module => {
                  const isEnabled = modules[module.id];
                  
                  return (
                    <div
                      key={module.id}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        {renderIcon(module.icon)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Label
                              htmlFor={`module-${module.id}`}
                              className="font-medium cursor-pointer"
                            >
                              {module.name}
                            </Label>                            
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {module.description}
                          </p>                          
                        </div>
                      </div>
                      <Switch
                        id={`module-${module.id}`}
                        checked={isEnabled}
                        onCheckedChange={() => handleToggleModule(module.id)}
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resumen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {Object.values(modules).filter(Boolean).length}
              </div>
              <div className="text-sm text-muted-foreground">Módulos activos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">
                {Object.values(modules).filter(v => !v).length}
              </div>
              <div className="text-sm text-muted-foreground">Módulos inactivos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {AVAILABLE_MODULES.length}
              </div>
              <div className="text-sm text-muted-foreground">Total disponibles</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
