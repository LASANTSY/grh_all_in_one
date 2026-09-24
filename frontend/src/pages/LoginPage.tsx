import { Navigate } from 'react-router-dom';
import { useAuth } from '@/app/auth-context';
import { LoginForm } from '@/features/auth/components/LoginForm';

export function LoginPage() {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border border-border bg-card p-8 shadow-sm">
        <div className="flex flex-col items-center space-y-3">
          <img src="/logo.png" alt="GRH EMMN" className="h-16 w-16 object-contain" />
          <div className="space-y-1 text-center">
            <h1 className="text-2xl font-semibold text-foreground">GRH EMMN</h1>
            <p className="text-sm text-muted-foreground">
              Application de gestion des ressources humaines
              <br />
              Etat-Major de la Marine Nationale
            </p>
          </div>
        </div>

        <LoginForm />

        <p className="text-center text-xs text-muted-foreground">
          En cas de probleme de connexion, contactez l administrateur.
        </p>
      </div>
    </div>
  );
}