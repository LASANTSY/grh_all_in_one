import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState } from '@/components/shared/EmptyState';
import { apiClient } from '@/lib/axios';
import { formatDateTime } from '@/lib/formatters';

interface Demande {
  id: string; personnelId: string; champModifie: string;
  ancienneValeur: string | null; nouvelleValeur: string;
  statut: string; dateDemande: string;
}

export function DemandesModificationPage() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['demandes', 'list'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Demande[] }>('/demandes-modification');
      return data.data;
    },
  });

  const validerMutation = useMutation({
    mutationFn: async (id: string) => { await apiClient.post(`/demandes-modification/${id}/valider`); },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['demandes'] }),
  });

  const rejeterMutation = useMutation({
    mutationFn: async ({ id, motif }: { id: string; motif: string }) => {
      await apiClient.post(`/demandes-modification/${id}/rejeter`, { motifRejet: motif });
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['demandes'] }),
  });

  const enAttente = (query.data ?? []).filter((d) => d.statut === 'EN_ATTENTE');

  return (
    <div className="space-y-6">
      <PageHeader title="Demandes de modification" description="Workflow de validation des modifications proposees" />
      {enAttente.length === 0 ? (
        <EmptyState title="Aucune demande en attente" description="Toutes les demandes ont ete traitees." />
      ) : (
        <Card>
          <Table>
            <TableHeader><TableRow>
              <TableHead>Date</TableHead><TableHead>Champ</TableHead>
              <TableHead>Ancienne valeur</TableHead><TableHead>Nouvelle valeur</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {enAttente.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="text-xs">{formatDateTime(d.dateDemande)}</TableCell>
                  <TableCell className="font-medium">{d.champModifie}</TableCell>
                  <TableCell className="text-xs">{d.ancienneValeur ?? '-'}</TableCell>
                  <TableCell className="text-xs">{d.nouvelleValeur}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => validerMutation.mutate(d.id)}>
                      <Check className="h-4 w-4 text-[var(--success)]" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => rejeterMutation.mutate({ id: d.id, motif: 'Rejete par le RH' })}>
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}