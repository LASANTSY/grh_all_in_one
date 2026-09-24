import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const LABELS: Record<string, string> = {
  dashboard: 'Tableau de bord',
  personnels: 'Personnels',
  recherche: 'Recherche',
  imports: 'Imports',
  demandes: 'Demandes',
  referentiels: 'Referentiels',
  bases: 'Bases',
  unites: 'Unites',
  grades: 'Grades',
  specialites: 'Specialites',
  utilisateurs: 'Utilisateurs',
  audit: 'Audit',
  parametres: 'Parametres',
  nouveau: 'Nouveau',
  modifier: 'Modifier',
};

interface Segment {
  label: string;
  href: string;
  isLast: boolean;
}

export function Breadcrumbs() {
  const location = useLocation();

  const segments: Segment[] = location.pathname
    .split('/')
    .filter(Boolean)
    .map((part, index, all) => {
      const href = '/' + all.slice(0, index + 1).join('/');
      const label = LABELS[part] ?? (part.length > 12 ? `${part.slice(0, 8)}...` : part);
      return {
        label,
        href,
        isLast: index === all.length - 1,
      };
    });

  if (segments.length === 0) return null;

  return (
    <nav aria-label="Fil d Ariane" className="flex items-center gap-1 text-xs text-muted-foreground">
      <Link to="/dashboard" className="flex items-center gap-1 hover:text-foreground">
        <Home className="h-3 w-3" />
        <span className="sr-only">Accueil</span>
      </Link>
      {segments.map((segment) => (
        <span key={segment.href} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3" />
          {segment.isLast ? (
            <span className="font-medium text-foreground">{segment.label}</span>
          ) : (
            <Link to={segment.href} className="hover:text-foreground">
              {segment.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}