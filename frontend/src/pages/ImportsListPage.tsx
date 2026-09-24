import { useQuery } from '@tanstack/react-query';
import { Upload } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState } from '@/components/shared/EmptyState';
import { apiClient } from '@/lib/axios';
import { formatDateTime } from '@/lib/formatters';

interface ImportItem {
  id: string; dateImport: string; nomFichierSource: string;
  nombreLignes: number; lignesCreees: number; lignesErreurs?: number;
  statut: string;
}

export function ImportsListPage() {
  const query = useQuery({
    queryKey: ['imports', 'list'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: ImportItem[] }>('/imports');
      return data.data;
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Imports Excel" description="Historique des imports de personnel"
        actions={
          <Button asChild>
            <a href="http://localhost:3000/api/imports/template" target="_blank" rel="noreferrer">
               Telecharger le modele
            </a>
          </Button>
        }
      />
      {query.data?.length === 0 && (
        <EmptyState icon={<Upload className="h-10 w-10" />} title="Aucun import" description="Aucun import n a ete effectue pour le moment." />
      )}
      {query.data && query.data.length > 0 && (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Fichier</TableHead>
                <TableHead>Lignes</TableHead>
                <TableHead>Creees</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-xs">{formatDateTime(item.dateImport)}</TableCell>
                  <TableCell>{item.nomFichierSource}</TableCell>
                  <TableCell>{item.nombreLignes}</TableCell>
                  <TableCell>{item.lignesCreees}</TableCell>
                  <TableCell>{item.statut}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}