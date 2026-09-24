import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { apiClient } from '@/lib/axios';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';

interface ReferentielItem { id: string; nom?: string; libelle?: string; code?: string; ville?: string; actif: boolean; }

export function ReferentielsPage({ endpoint, title, fieldLabel }: { endpoint: string; title: string; fieldLabel: string }) {
  const queryClient = useQueryClient();
  const [newValue, setNewValue] = useState('');

  const query = useQuery({
    queryKey: ['referentiels', endpoint],
    queryFn: async () => {
      const { data } = await apiClient.get<ReferentielItem[]>(`/${endpoint}`);
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (value: string) => {
      const key = fieldLabel.toLowerCase();
      const payload: Record<string, string> = { [key]: value };
      await apiClient.post(`/${endpoint}`, payload);
    },
    onSuccess: () => {
      setNewValue('');
      void queryClient.invalidateQueries({ queryKey: ['referentiels', endpoint] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await apiClient.delete(`/${endpoint}/${id}`); },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['referentiels', endpoint] }),
  });

  return (
    <div className="space-y-6">
      <PageHeader title={title} description={`Gestion des ${title.toLowerCase()}`} />
      <Card>
        <CardContent className="p-4">
          <form
            onSubmit={(e) => { e.preventDefault(); if (newValue.trim()) createMutation.mutate(newValue.trim()); }}
            className="flex gap-2"
          >
            <Input value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder={`Nouveau ${fieldLabel.toLowerCase()}`} />
            <Button type="submit" disabled={createMutation.isPending || !newValue.trim()}>
              <Plus className="mr-1 h-4 w-4" /> Ajouter
            </Button>
          </form>
        </CardContent>
      </Card>
      {query.isLoading ? <LoadingSkeleton rows={5} /> : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(query.data ?? []).map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.libelle ?? item.nom} {item.code && <span className="text-xs text-muted-foreground">({item.code})</span>}</TableCell>
                  <TableCell>{item.actif ? 'Actif' : 'Inactif'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(item.id)}>
                      <Trash2 className="h-4 w-4" />
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

export const BasesPage = () => <ReferentielsPage endpoint="bases" title="Bases" fieldLabel="Nom" />;
export const UnitesPage = () => <ReferentielsPage endpoint="unites" title="Unites" fieldLabel="Nom" />;
export const GradesPage = () => <ReferentielsPage endpoint="grades" title="Grades" fieldLabel="Libelle" />;
export const SpecialitesPage = () => <ReferentielsPage endpoint="specialites" title="Specialites" fieldLabel="Libelle" />;