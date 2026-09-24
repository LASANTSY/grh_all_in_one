import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { apiClient } from '@/lib/axios';
import { formatDateTime } from '@/lib/formatters';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';

interface AuditItem {
  id: string; action: string; entiteType: string; entiteId: string;
  champModifie: string | null; dateHeure: string;
  auteur: { identifiant: string } | null;
}

export function AuditPage() {
  const query = useQuery({
    queryKey: ['audit', 'list'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: AuditItem[] }>('/audit');
      return data.data;
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Journal d audit" description="Tracabilite des actions sensibles" />
      {query.isLoading ? <LoadingSkeleton rows={8} /> : (
        <Card>
          <Table>
            <TableHeader><TableRow>
              <TableHead>Date</TableHead><TableHead>Action</TableHead>
              <TableHead>Entite</TableHead><TableHead>Champ</TableHead><TableHead>Auteur</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {(query.data ?? []).map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="text-xs">{formatDateTime(a.dateHeure)}</TableCell>
                  <TableCell className="text-xs font-medium">{a.action}</TableCell>
                  <TableCell className="text-xs">{a.entiteType}</TableCell>
                  <TableCell className="text-xs">{a.champModifie ?? '-'}</TableCell>
                  <TableCell className="text-xs">{a.auteur?.identifiant ?? 'Systeme'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}