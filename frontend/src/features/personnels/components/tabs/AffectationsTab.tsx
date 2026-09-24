import { useState } from 'react';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/axios';
import { useUnites } from '@/features/referentiels/hooks/useReferentiels';
import { formatDate } from '@/lib/formatters';

interface Affectation {
  id: string;
  uniteId: string;
  unite: { nom: string; code: string };
  decision: string | null;
  dateEffet: string;
  fonctionEmploi: string | null;
  observations: string | null;
}

interface FormState {
  uniteId: string;
  decision: string;
  dateEffet: string;
  fonctionEmploi: string;
  observations: string;
}

export function AffectationsTab({ personnelId }: { personnelId: string }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>({
    uniteId: '',
    decision: '',
    dateEffet: '',
    fonctionEmploi: '',
    observations: '',
  });

  const unitesQuery = useUnites();

  const query = useQuery({
    queryKey: ['personnels', personnelId, 'affectations'],
    queryFn: async () => {
      const { data } = await apiClient.get<Affectation[]>(`/personnels/${personnelId}/affectations`);
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async (payload: FormState) => {
      await apiClient.post(`/personnels/${personnelId}/affectations`, payload);
    },
    onSuccess: () => {
      setOpen(false);
      setForm({ uniteId: '', decision: '', dateEffet: '', fonctionEmploi: '', observations: '' });
      void queryClient.invalidateQueries({ queryKey: ['personnels', personnelId, 'affectations'] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/personnels/${personnelId}/affectations/${id}`);
    },
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: ['personnels', personnelId, 'affectations'] }),
  });

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    addMutation.mutate(form);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Affectations successives</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" /> Ajouter
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouvelle affectation</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Unite</Label>
                  <Select
                    value={form.uniteId}
                    onValueChange={(v) => setForm({ ...form, uniteId: v ?? '' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir une unite" />
                    </SelectTrigger>
                    <SelectContent>
                      {(unitesQuery.data ?? []).map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.nom} ({u.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Decision</Label>
                  <Input
                    value={form.decision}
                    onChange={(e) => setForm({ ...form, decision: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Date d effet</Label>
                  <Input
                    type="date"
                    value={form.dateEffet}
                    onChange={(e) => setForm({ ...form, dateEffet: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Fonction / emploi</Label>
                  <Input
                    value={form.fonctionEmploi}
                    onChange={(e) => setForm({ ...form, fonctionEmploi: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Observations</Label>
                  <Input
                    value={form.observations}
                    onChange={(e) => setForm({ ...form, observations: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={addMutation.isPending || !form.uniteId}>
                  {addMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enregistrement...
                    </>
                  ) : (
                    'Ajouter'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-0">
        {query.isLoading ? (
          <div className="p-4">
            <Skeleton className="h-32 w-full" />
          </div>
        ) : !query.data || query.data.length === 0 ? (
          <div className="p-4">
            <EmptyState title="Aucune affectation" description="Aucune affectation enregistree." />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date d effet</TableHead>
                <TableHead>Unite</TableHead>
                <TableHead>Fonction / emploi</TableHead>
                <TableHead>Decision</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.data.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="text-xs">{formatDate(a.dateEffet)}</TableCell>
                  <TableCell>{a.unite?.nom ?? '-'}</TableCell>
                  <TableCell>{a.fonctionEmploi ?? '-'}</TableCell>
                  <TableCell className="text-xs">{a.decision ?? '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMutation.mutate(a.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
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