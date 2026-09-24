import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
      <ShieldAlert className="h-16 w-16 text-destructive" />
      <h1 className="text-4xl font-bold">403</h1>
      <p className="text-muted-foreground">Acces refuse. Vous n avez pas les droits necessaires.</p>
      <Button asChild>
        <Link to="/dashboard">Retour au tableau de bord</Link>
      </Button>
    </div>
  );
}