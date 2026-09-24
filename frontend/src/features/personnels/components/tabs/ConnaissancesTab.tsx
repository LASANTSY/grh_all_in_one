import { useQuery } from '@tanstack/react-query';
import { Languages } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/axios';

interface Competence {
  id: string;
  langue: string;
  niveauEcrit: 'AVANCE' | 'MOYEN' | 'MAUVAIS';
  niveauParle: 'AVANCE' | 'MOYEN' | 'MAUVAIS';
}

const NIVEAU_LABELS: Record<string, string> = {
  AVANCE: 'Avance',
  MOYEN: 'Moyen',
  MAUVAIS: 'Mauvais',
};

export function ConnaissancesTab({ personnelId }: { personnelId: string }) {
  const query = useQuery({
    queryKey: ['personnels', personnelId, 'competences'],
    queryFn: async () => { const { data } = await apiClient.get<Competence[]>(`/personnels/${personnelId}/competences-linguistiques`); return data; },
  });

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Connaissances linguistiques</CardTitle></CardHeader>
      <CardContent className="p-0">
        {query.isLoading ? <div className="p-4"><Skeleton className="h-32 w-full" /></div> :
         !query.data || query.data.length === 0 ? (
          <div className="p-4"><EmptyState icon={<Languages className="h-10 w-10" />} title="Aucune competence" description="Aucune competence linguistique enregistree." /></div>
        ) : (
          <Table>
            <TableHeader><TableRow>
              <TableHead>Langue</TableHead><TableHead>Niveau ecrit</TableHead><TableHead>Niveau parle</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {query.data.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.langue}</TableCell>
                  <TableCell>{NIVEAU_LABELS[c.niveauEcrit]}</TableCell>
                  <TableCell>{NIVEAU_LABELS[c.niveauParle]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}