import { useState } from 'react';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { useAddEnfant, useEnfants, useRemoveEnfant } from '../../hooks/usePersonnelDetail';
import { formatDate } from '@/lib/formatters';

interface Enfant {
  id: string;
  rang: number;
  nom: string;
  prenoms: string;
  dateNaissance: string;
  sexe: string;
  lienParente: string;
}

export function EnfantsTab({ personnelId }: { personnelId: string }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    rang: '1',
    nom: '',
    prenoms: '',
    dateNaissance: '',
    sexe: 'M',
    lienParente: 'Fils',
  });

  const query = useEnfants(personnelId);
  const addMutation = useAddEnfant(personnelId);
  const removeMutation = useRemoveEnfant(personnelId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.mutate(
      {
        rang: parseInt(form.rang, 10),
        nom: form.nom,
        prenoms: form.prenoms,
        dateNaissance: form.dateNaissance,
        sexe: form.sexe,
        lienParente: form.lienParente,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setForm({ rang: '1', nom: '', prenoms: '', dateNaissance: '', sexe: 'M', lienParente: 'Fils' });
        },
      },
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Enfants a charge</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" /> Ajouter
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un enfant</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="rang">Rang</Label>
                  <Input id="rang" type="number" min="1" value={form.rang} onChange={(e) => setForm({ ...form, rang: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sexe">Sexe</Label>
                  <Select value={form.sexe} onValueChange={(v) => setForm({ ...form, sexe: v })}>
                    <SelectTrigger id="sexe"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculin</SelectItem>
                      <SelectItem value="F">Feminin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="nom">Nom</Label>
                  <Input id="nom" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prenoms">Prenoms</Label>
                  <Input id="prenoms" value={form.prenoms} onChange={(e) => setForm({ ...form, prenoms: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="dateNaissance">Date de naissance</Label>
                  <Input id="dateNaissance" type="date" value={form.dateNaissance} onChange={(e) => setForm({ ...form, dateNaissance: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lienParente">Lien de parente</Label>
                  <Select value={form.lienParente} onValueChange={(v) => setForm({ ...form, lienParente: v })}>
                    <SelectTrigger id="lienParente"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fils">Fils</SelectItem>
                      <SelectItem value="Fille">Fille</SelectItem>
                      <SelectItem value="Adopte">Adopte</SelectItem>
                      <SelectItem value="Autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
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
        {query.isLoading ? (
          <div className="p-4"><Skeleton className="h-32 w-full" /></div>
        ) : !query.data || query.data.length === 0 ? (
          <div className="p-4">
            <EmptyState title="Aucun enfant" description="Aucun enfant a charge enregistre pour ce personnel." />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rang</TableHead>
                <TableHead>Nom et prenoms</TableHead>
                <TableHead>Date de naissance</TableHead>
                <TableHead>Sexe</TableHead>
                <TableHead>Lien</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(query.data as Enfant[]).map((e) => (
                <TableRow key={e.id}>
                  <TableCell>{e.rang}</TableCell>
                  <TableCell className="font-medium">{e.nom.toUpperCase()} {e.prenoms}</TableCell>
                  <TableCell className="text-xs">{formatDate(e.dateNaissance)}</TableCell>
                  <TableCell>{e.sexe}</TableCell>
                  <TableCell>{e.lienParente}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => removeMutation.mutate(e.id)}>
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