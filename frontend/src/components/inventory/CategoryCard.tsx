import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Edit, Trash2, Package } from 'lucide-react';
import { ProductCategory } from '@/services/inventory.service';

interface CategoryCardProps {
  category: ProductCategory & { _count?: { products: number } };
  onEdit: (category: ProductCategory) => void;
  onDelete: (categoryId: string) => void;
}

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex-1">
          <CardTitle className="text-base font-semibold">{category.name}</CardTitle>
          <Badge variant={category.isActive ? 'default' : 'secondary'} className="mt-1">
            {category.isActive ? 'Activa' : 'Inactiva'}
          </Badge>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(category)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(category.id)}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {category.description && (
            <p className="text-sm text-muted-foreground">{category.description}</p>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Package className="h-4 w-4" />
            <span>{category._count?.products || 0} productos</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
