import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Check, X, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState } from '@/components/shared/EmptyState';
import { apiClient } from '@/lib/axios';
import { formatDateTime } from '@/lib/formatters';
import { usePermissions } from '@/hooks/usePermissions';

interface Demande {
  id: string; champModifie: string;
  ancienneValeur: string | null; nouvelleValeur: string;
  statut: string; dateDemande: string;
}

const CHAMPS_MODIFIABLES = [
  { value: 'email', label: 'Email' },
  { value: 'telephoneMobile', label: 'Telephone mobile' },
  { value: 'adresseActuelle', label: 'Adresse actuelle' },
  { value: 'adresseRepli', label: 'Adresse de repli' },
  { value: 'contactUrgence', label: 'Contact d urgence' },
  { value: 'statutFamilial', label: 'Statut familial' },
  { value: 'nomConjoint', label: 'Nom du conjoint' },
  { value: 'sportsPratiques', label: 'Sports pratiques' },
];

export function DemandesModificationPage() {
  const queryClient = useQueryClient();
  const perms = usePermissions();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ champModifie: 'email', nouvelleValeur: '' });
  const [rejetOpen, setRejetOpen] = useState<string | null>(null);
  const [motif, setMotif] = useState('');

  const query = useQuery({
    queryKey: ['demandes', 'list'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Demande[] }>('/demandes-modification');
      return data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post('/demandes-modification', form);
    },
    onSuccess: () => {
      setForm({ champModifie: 'email', nouvelleValeur: '' });
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey: ['demandes'] });
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
    onSuccess: () => {
      setRejetOpen(null);
      setMotif('');
      void queryClient.invalidateQueries({ queryKey: ['demandes'] });
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Demandes de modification"
        description="Workflow de validation des modifications proposees"
        actions={
          perms.canSubmitDemande ? (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" /> Proposer une modification</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Nouvelle demande de modification</DialogTitle></DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Champ a modifier</Label>
                    <Select value={form.champModifie} onValueChange={(v) => setForm({ ...form, champModifie: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CHAMPS_MODIFIABLES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Nouvelle valeur</Label>
                    <Input value={form.nouvelleValeur} onChange={(e) => setForm({ ...form, nouvelleValeur: e.target.value })} required />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Envoi...</> : 'Envoyer la demande'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          ) : undefined
        }
      />

      {!query.data || query.data.length === 0 ? (
        <EmptyState title="Aucune demande" description="Aucune demande de modification enregistree." />
      ) : (
        <Card>
          <Table>
            <TableHeader><TableRow>
              <TableHead>Date</TableHead><TableHead>Champ</TableHead>
              <TableHead>Ancienne</TableHead><TableHead>Nouvelle</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {query.data.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="text-xs">{formatDateTime(d.dateDemande)}</TableCell>
                  <TableCell className="font-medium">{d.champModifie}</TableCell>
                  <TableCell className="text-xs">{d.ancienneValeur ?? '-'}</TableCell>
                  <TableCell className="text-xs">{d.nouvelleValeur}</TableCell>
                  <TableCell className="text-xs">{d.statut}</TableCell>
                  <TableCell className="text-right">
                    {perms.canValidateDemandes && d.statut === 'EN_ATTENTE' && (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => validerMutation.mutate(d.id)} title="Valider">
                          <Check className="h-4 w-4 text-[var(--success)]" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setRejetOpen(d.id)} title="Rejeter">
                          <X className="h-4 w-4 text-destructive" />
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={rejetOpen !== null} onOpenChange={(o) => { if (!o) { setRejetOpen(null); setMotif(''); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Motif du rejet</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Label>Motif obligatoire</Label>
            <Input value={motif} onChange={(e) => setMotif(e.target.value)} placeholder="Raison du rejet..." />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRejetOpen(null); setMotif(''); }}>Annuler</Button>
            <Button variant="destructive" disabled={!motif.trim() || rejeterMutation.isPending}
              onClick={() => rejetOpen && rejeterMutation.mutate({ id: rejetOpen, motif })}>
              {rejeterMutation.isPending ? 'Traitement...' : 'Rejeter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}