import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';

interface DeletePatientDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeletePatientDialog({
  open,
  onConfirm,
  onCancel,
}: DeletePatientDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <DialogTitle>Eliminar Paciente</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            ¿Estás seguro de que deseas eliminar este paciente? Esta acción no se
            puede deshacer y se eliminará toda la información asociada.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
