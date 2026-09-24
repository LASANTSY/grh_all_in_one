import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Loader2, KeyRound, Unlock } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiClient } from '@/lib/axios';
import { formatDateTime } from '@/lib/formatters';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';

interface Utilisateur {
  id: string;
  identifiant: string;
  typeCompte: string;
  actif: boolean;
  compteVerrouille: boolean;
  dateDerniereConnexion: string | null;
}

interface FormState {
  identifiant: string;
  typeCompte: string;
  unitePerimetreId: string;
}

interface CreateResponse {
  motDePasseProvisoire: string;
  compte: Utilisateur;
}

const ROLES = [
  { value: 'ADMIN_SYSTEME', label: 'Administrateur systeme' },
  { value: 'RH_ETAT_MAJOR', label: 'RH Etat-Major' },
  { value: 'RH_BASE', label: 'RH Base' },
  { value: 'CHEF_COMMANDEMENT', label: 'Chef / Commandement' },
  { value: 'PERSONNEL', label: 'Personnel' },
];

export function UtilisateursPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<{
    identifiant: string;
    motDePasse: string;
  } | null>(null);
  const [form, setForm] = useState<FormState>({
    identifiant: '',
    typeCompte: 'RH_BASE',
    unitePerimetreId: '',
  });

  const query = useQuery({
    queryKey: ['utilisateurs', 'list'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Utilisateur[] }>('/utilisateurs');
      return data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: FormState) => {
      const body: Record<string, string> = {
        identifiant: payload.identifiant,
        typeCompte: payload.typeCompte,
      };
      if (payload.unitePerimetreId) body.unitePerimetreId = payload.unitePerimetreId;
      const { data } = await apiClient.post<CreateResponse>('/utilisateurs', body);
      return data;
    },
    onSuccess: (data) => {
      setGeneratedPassword({
        identifiant: data.compte.identifiant,
        motDePasse: data.motDePasseProvisoire,
      });
      setForm({ identifiant: '', typeCompte: 'RH_BASE', unitePerimetreId: '' });
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey: ['utilisateurs'] });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post<CreateResponse>(
        `/utilisateurs/${id}/reset-password`,
      );
      return data;
    },
    onSuccess: (data) => {
      setGeneratedPassword({
        identifiant: data.compte.identifiant,
        motDePasse: data.motDePasseProvisoire,
      });
    },
  });

  const unlockMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.post(`/utilisateurs/${id}/unlock`);
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['utilisateurs'] }),
  });

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Utilisateurs"
        description="Gestion des comptes utilisateurs"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Nouveau compte
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Creer un compte utilisateur</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Identifiant</Label>
                  <Input
                    value={form.identifiant}
                    onChange={(e) => setForm({ ...form, identifiant: e.target.value })}
                    required
                    minLength={3}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Type de compte</Label>
                  <Select
                    value={form.typeCompte}
                    onValueChange={(v) =>
                      setForm({ ...form, typeCompte: v ?? 'RH_BASE' })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {(form.typeCompte === 'RH_BASE' ||
                  form.typeCompte === 'CHEF_COMMANDEMENT') && (
                  <div className="space-y-1.5">
                    <Label>ID de l unite de perimetre (UUID)</Label>
                    <Input
                      value={form.unitePerimetreId}
                      onChange={(e) =>
                        setForm({ ...form, unitePerimetreId: e.target.value })
                      }
                      placeholder="UUID de l unite"
                      required
                    />
                  </div>
                )}
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creation...
                      </>
                    ) : (
                      'Creer'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {generatedPassword && (
        <Card className="border-[var(--success)]/40 bg-[var(--success)]/5 p-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Mot de passe provisoire genere</p>
            <p className="text-xs text-muted-foreground">
              Notez ce mot de passe maintenant. Il ne sera plus affiche.
            </p>
            <div className="rounded-md border bg-background p-3 font-mono text-sm">
              <p>
                Identifiant : <strong>{generatedPassword.identifiant}</strong>
              </p>
              <p>
                Mot de passe : <strong>{generatedPassword.motDePasse}</strong>
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setGeneratedPassword(null)}
            >
              Fermer
            </Button>
          </div>
        </Card>
      )}

      {query.isLoading ? (
        <LoadingSkeleton rows={5} />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Identifiant</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Derniere connexion</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(query.data ?? []).map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-mono text-xs">{u.identifiant}</TableCell>
                  <TableCell className="text-xs">
                    {ROLES.find((r) => r.value === u.typeCompte)?.label ?? u.typeCompte}
                  </TableCell>
                  <TableCell>
                    {u.compteVerrouille ? (
                      <span className="text-xs text-destructive">Verrouille</span>
                    ) : u.actif ? (
                      <span className="text-xs text-[var(--success)]">Actif</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Inactif</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs">
                    {u.dateDerniereConnexion
                      ? formatDateTime(u.dateDerniereConnexion)
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {u.compteVerrouille && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => unlockMutation.mutate(u.id)}
                        title="Deverrouiller"
                      >
                        <Unlock className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => resetPasswordMutation.mutate(u.id)}
                      title="Reinitialiser mot de passe"
                    >
                      <KeyRound className="h-4 w-4" />
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