import { useQuery } from '@tanstack/react-query';
import { Medal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/axios';
import { formatDate } from '@/lib/formatters';

interface HistoriqueGrade {
  id: string;
  grade: { libelle: string };
  referenceDecret: string | null;
  datePriseCommandement: string;
  observations: string | null;
}

export function HistoriqueGradesTab({ personnelId }: { personnelId: string }) {
  const query = useQuery({
    queryKey: ['personnels', personnelId, 'historique-grades'],
    queryFn: async () => {
      const { data } = await apiClient.get<HistoriqueGrade[]>(`/personnels/${personnelId}/historique-grades`);
      return data;
    },
  });

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Historique des grades</CardTitle></CardHeader>
      <CardContent className="p-0">
        {query.isLoading ? <div className="p-4"><Skeleton className="h-32 w-full" /></div> :
         !query.data || query.data.length === 0 ? (
          <div className="p-4"><EmptyState icon={<Medal className="h-10 w-10" />} title="Aucun historique" description="Aucun historique de grade enregistre." /></div>
        ) : (
          <Table>
            <TableHeader><TableRow>
              <TableHead>Grade</TableHead><TableHead>Reference decret</TableHead>
              <TableHead>Date de prise</TableHead><TableHead>Observations</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {query.data.map((h) => (
                <TableRow key={h.id}>
                  <TableCell className="font-medium">{h.grade?.libelle}</TableCell>
                  <TableCell className="text-xs">{h.referenceDecret ?? '-'}</TableCell>
                  <TableCell className="text-xs">{formatDate(h.datePriseCommandement)}</TableCell>
                  <TableCell className="text-xs">{h.observations ?? '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}