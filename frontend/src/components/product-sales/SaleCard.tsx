import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Eye, User, ShoppingCart, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface SaleCardProps {
  sale: any;
  onViewDetails: (saleId: string) => void;
}

export function SaleCard({ sale, onViewDetails }: SaleCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(amount);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex-1">
          <CardTitle className="text-base font-semibold">
            Venta #{sale.id.slice(0, 8)}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {format(new Date(sale.createdAt), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewDetails(sale.id)}
          className="gap-2"
        >
          <Eye className="h-4 w-4" />
          Ver
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sale.patient && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{sale.patient.firstName} {sale.patient.lastName}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm">
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            <span>{sale.items?.length || 0} producto(s)</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-lg font-bold text-primary">
                {formatCurrency(sale.total)}
              </span>
            </div>
            {sale.payment && (
              <Badge variant="secondary">
                {sale.payment.method}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
