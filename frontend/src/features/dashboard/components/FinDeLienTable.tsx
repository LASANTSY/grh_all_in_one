import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { useFinDeLien } from '../hooks/useFinDeLien';
import { formatDate } from '@/lib/formatters';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import type { FinDeLienItem, StatutFinDeLien } from '@/types/dashboard';

const STATUT_LABELS: Record<StatutFinDeLien, string> = {
  ACTIF: 'Actif',
  ALERTE_ANNUELLE: 'Retraite < 1 an',
  ALERTE_BIENNALE: 'Retraite < 2 ans',
  RETRAITE_DEPASSEE: 'Retraite depassee',
};

function formatJoursRestants(jours: number): string {
  if (jours < 0) return `Depasse de ${Math.abs(jours)} j`;
  if (jours === 0) return "Aujourd'hui";
  return `Dans ${jours} j`;
}

export function FinDeLienTable() {
  const { data, isLoading, isError } = useFinDeLien();

  const alertsOnly = (data ?? [])
    .filter((item) => item.statut !== 'ACTIF')
    .slice(0, 8);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Alertes fin de lien</CardTitle>
        <Button asChild variant="ghost" size="sm">
          <Link to="/dashboard?section=fin-de-lien">
            Voir tout
            <ChevronRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-5">
            <Skeleton className="h-48 w-full" />
          </div>
        ) : isError ? (
          <p className="p-8 text-center text-sm text-muted-foreground">Erreur de chargement.</p>
        ) : alertsOnly.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={<AlertTriangle className="h-8 w-8" />}
              title="Aucune alerte"
              description="Aucun personnel en fin de lien dans les 2 prochaines annees."
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Matricule</TableHead>
                <TableHead>Nom et prenoms</TableHead>
                <TableHead className="hidden md:table-cell">Grade</TableHead>
                <TableHead className="hidden lg:table-cell">Unite</TableHead>
                <TableHead>Fin de lien</TableHead>
                <TableHead className="text-right">Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alertsOnly.map((item) => (
                <TableRow key={item.personnelId}>
                  <TableCell className="font-mono text-xs">{item.matriculeRecrutement}</TableCell>
                  <TableCell className="font-medium">
                    <Link
                      to={`/personnels/${item.personnelId}`}
                      className="hover:text-primary hover:underline"
                    >
                      {item.nom.toUpperCase()} {item.prenoms}
                    </Link>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs">
                    {item.gradeLibelle}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                    {item.uniteLibelle}
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="flex flex-col">
                      <span>{formatDate(item.dateFinDeLien)}</span>
                      <span className="text-muted-foreground">
                        {formatJoursRestants(item.joursRestants)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <StatusBadge alerte={item.statut}>
                      {STATUT_LABELS[item.statut as FinDeLienItem['statut']]}
                    </StatusBadge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}