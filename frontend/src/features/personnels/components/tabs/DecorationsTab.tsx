import { useState } from 'react';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/axios';
import { formatDate } from '@/lib/formatters';

interface Decoration {
  id: string;
  libelle: string;
  reference: string | null;
  dateEffet: string;
  observations: string | null;
}

export function DecorationsTab({ personnelId }: { personnelId: string }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ libelle: '', reference: '', dateEffet: '', observations: '' });

  const query = useQuery({
    queryKey: ['personnels', personnelId, 'decorations'],
    queryFn: async () => {
      const { data } = await apiClient.get<Decoration[]>(`/personnels/${personnelId}/decorations`);
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async (payload: typeof form) => {
      await apiClient.post(`/personnels/${personnelId}/decorations`, payload);
    },
    onSuccess: () => {
      setOpen(false);
      setForm({ libelle: '', reference: '', dateEffet: '', observations: '' });
      void queryClient.invalidateQueries({ queryKey: ['personnels', personnelId, 'decorations'] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => { await apiClient.delete(`/personnels/${personnelId}/decorations/${id}`); },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['personnels', personnelId, 'decorations'] }),
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Decorations successives</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Ajouter</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nouvelle decoration</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); addMutation.mutate(form); }} className="space-y-4">
              <div className="space-y-1.5"><Label>Libelle</Label><Input value={form.libelle} onChange={(e) => setForm({ ...form, libelle: e.target.value })} required /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5"><Label>Reference</Label><Input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Date d effet</Label><Input type="date" value={form.dateEffet} onChange={(e) => setForm({ ...form, dateEffet: e.target.value })} required /></div>
              </div>
              <div className="space-y-1.5"><Label>Observations</Label><Input value={form.observations} onChange={(e) => setForm({ ...form, observations: e.target.value })} /></div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
                <Button type="submit" disabled={addMutation.isPending}>
                  {addMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enregistrement...</> : 'Ajouter'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-0">
        {query.isLoading ? <div className="p-4"><Skeleton className="h-32 w-full" /></div> :
         !query.data || query.data.length === 0 ? <div className="p-4"><EmptyState title="Aucune decoration" /></div> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Libelle</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Date d effet</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.data.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.libelle}</TableCell>
                  <TableCell className="text-xs">{d.reference ?? '-'}</TableCell>
                  <TableCell className="text-xs">{formatDate(d.dateEffet)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => removeMutation.mutate(d.id)}>
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