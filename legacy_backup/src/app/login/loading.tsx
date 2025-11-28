import { Loader2 } from 'lucide-react';

export default function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-clinq-purple-900">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-clinq-cyan-500 mx-auto" />
        <p className="text-white/70">Cargando página de inicio de sesión...</p>
      </div>
    </div>
  );
}
