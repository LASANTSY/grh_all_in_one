import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { PageHeader } from '@/components/shared/PageHeader';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { personnelDetailService } from '@/features/personnels/services/personnelDetailService';
import { usePermissions } from '@/hooks/usePermissions';
import { formatDate, formatInitiales } from '@/lib/formatters';

export function PersonnelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const perms = usePermissions();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const query = useQuery({
    queryKey: ['personnels', 'detail', id],
    queryFn: () => personnelDetailService.get(id!),
    enabled: Boolean(id),
  });

  const deleteMutation = useMutation({
    mutationFn: () => personnelDetailService.remove(id!),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['personnels'] });
      navigate('/personnels');
    },
  });

  if (query.isLoading) return <LoadingSkeleton rows={5} />;
  if (query.isError || !query.data) {
    return <ErrorState message="Impossible de charger cette fiche." onRetry={() => void query.refetch()} />;
  }

  const p = query.data;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/personnels')}>
        <ArrowLeft className="mr-1 h-4 w-4" /> Retour a la liste
      </Button>

      <PageHeader
        title={`${p.nom.toUpperCase()} ${p.prenoms}`}
        description={`Matricule : ${p.matriculeRecrutement}`}
        actions={
          <div className="flex gap-2">
            {perms.canEditPersonnel && (
              <Button asChild variant="outline">
                <Link to={`/personnels/${p.id}/modifier`}>
                  <Pencil className="mr-2 h-4 w-4" /> Modifier
                </Link>
              </Button>
            )}
            {perms.canDeletePersonnel && (
              <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" /> Desactiver
              </Button>
            )}
          </div>
        }
      />

      <Card>
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
          <Avatar className="h-20 w-20">
            {p.photoUrl && <AvatarImage src={p.photoUrl} alt="" />}
            <AvatarFallback className="bg-primary/10 text-xl text-primary">
              {formatInitiales(p.nom, p.prenoms)}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 grid-cols-2 gap-4 text-sm md:grid-cols-4">
            <div><span className="text-muted-foreground">Grade</span><p className="font-medium">{p.grade.libelle}</p></div>
            <div><span className="text-muted-foreground">Categorie</span><p className="font-medium">{p.grade.categorie}</p></div>
            <div><span className="text-muted-foreground">Unite</span><p className="font-medium">{p.unite.nom}</p></div>
            <div><span className="text-muted-foreground">Specialite</span><p className="font-medium">{p.specialite?.libelle ?? '-'}</p></div>
            <div><span className="text-muted-foreground">Naissance</span><p className="font-medium">{formatDate(p.dateNaissance)}</p></div>
            <div><span className="text-muted-foreground">Lieu de naissance</span><p className="font-medium">{p.lieuNaissance}</p></div>
            <div><span className="text-muted-foreground">Fin de lien</span><p className="font-medium">{p.dateFinDeLien ? formatDate(p.dateFinDeLien) : '-'}</p></div>
            <div><span className="text-muted-foreground">Statut</span><p><StatusBadge variant={p.actif ? 'success' : 'muted'}>{p.actif ? 'Actif' : 'Inactif'}</StatusBadge></p></div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="general">
        <TabsList className="flex-wrap">
          <TabsTrigger value="general">Informations generales</TabsTrigger>
          <TabsTrigger value="enfants">Enfants</TabsTrigger>
          <TabsTrigger value="militaire">Renseignements militaires</TabsTrigger>
          <TabsTrigger value="etudes">Etudes et formations</TabsTrigger>
          <TabsTrigger value="connaissances">Connaissances</TabsTrigger>
          <TabsTrigger value="affectations">Affectations</TabsTrigger>
          <TabsTrigger value="decorations">Decorations</TabsTrigger>
          <TabsTrigger value="documents">Pieces jointes</TabsTrigger>
        </TabsList>

        <TabsContent value="general"><GeneralTab p={p} /></TabsContent>
        <TabsContent value="enfants"><PlaceholderTab label="Enfants" /></TabsContent>
        <TabsContent value="militaire"><MilitaireTab p={p} /></TabsContent>
        <TabsContent value="etudes"><PlaceholderTab label="Etudes et formations" /></TabsContent>
        <TabsContent value="connaissances"><ConnaissancesTab p={p} /></TabsContent>
        <TabsContent value="affectations"><PlaceholderTab label="Affectations" /></TabsContent>
        <TabsContent value="decorations"><PlaceholderTab label="Decorations" /></TabsContent>
        <TabsContent value="documents"><PlaceholderTab label="Pieces jointes" /></TabsContent>
      </Tabs>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Desactiver cette fiche ?"
        description="La fiche sera masquee des listes. Elle pourra etre reactivee par un administrateur."
        variant="destructive"
        confirmLabel="Desactiver"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
      />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value && value !== '' ? value : '-'}</p>
    </div>
  );
}

function GeneralTab({ p }: { p: ReturnType<typeof personnelDetailService.get> extends Promise<infer T> ? T : never }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Informations generales</CardTitle></CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Matricule de recrutement" value={p.matriculeRecrutement} />
        <Field label="Matricule financier" value={p.matriculeFinancier} />
        <Field label="Email" value={p.email} />
        <Field label="Telephone" value={p.telephoneMobile} />
        <Field label="Numero CIN" value={p.numeroCIN} />
        <Field label="Date de naissance" value={formatDate(p.dateNaissance)} />
        <Field label="Lieu de naissance" value={p.lieuNaissance} />
      </CardContent>
    </Card>
  );
}

function MilitaireTab({ p }: { p: { grade: { libelle: string }; unite: { nom: string }; specialite: { libelle: string } | null } }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Renseignements militaires</CardTitle></CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Grade" value={p.grade.libelle} />
        <Field label="Unite" value={p.unite.nom} />
        <Field label="Specialite" value={p.specialite?.libelle ?? null} />
      </CardContent>
    </Card>
  );
}

function ConnaissancesTab({ p }: { p: { email: string | null } }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Connaissances particulieres</CardTitle></CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Les langues et connaissances informatiques seront affichees ici.</p>
      </CardContent>
    </Card>
  );
}

function PlaceholderTab({ label }: { label: string }) {
  return (
    <Card>
      <CardContent className="p-8 text-center text-sm text-muted-foreground">
        Onglet « {label} » — chargement detaille a venir
      </CardContent>
    </Card>
  );
}