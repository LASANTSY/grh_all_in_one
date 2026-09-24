import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { apiClient } from '@/lib/axios';
import { formatDateTime } from '@/lib/formatters';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';

interface Utilisateur { id: string; identifiant: string; typeCompte: string; actif: boolean; dateDerniereConnexion: string | null; }

export function UtilisateursPage() {
  const query = useQuery({
    queryKey: ['utilisateurs', 'list'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Utilisateur[] }>('/utilisateurs');
      return data.data;
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Utilisateurs" description="Gestion des comptes utilisateurs" />
      {query.isLoading ? <LoadingSkeleton rows={5} /> : (
        <Card>
          <Table>
            <TableHeader><TableRow>
              <TableHead>Identifiant</TableHead><TableHead>Role</TableHead>
              <TableHead>Statut</TableHead><TableHead>Derniere connexion</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {(query.data ?? []).map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-mono text-xs">{u.identifiant}</TableCell>
                  <TableCell>{u.typeCompte}</TableCell>
                  <TableCell>{u.actif ? 'Actif' : 'Inactif'}</TableCell>
                  <TableCell className="text-xs">{u.dateDerniereConnexion ? formatDateTime(u.dateDerniereConnexion) : '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}