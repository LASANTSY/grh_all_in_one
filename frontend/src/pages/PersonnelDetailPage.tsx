import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import { EnfantsTab } from '@/features/personnels/components/tabs/EnfantsTab';
import { AffectationsTab } from '@/features/personnels/components/tabs/AffectationsTab';
import { DecorationsTab } from '@/features/personnels/components/tabs/DecorationsTab';
import { DocumentsTab } from '@/features/personnels/components/tabs/DocumentsTab';
import { EtudesFormationsTab } from '@/features/personnels/components/tabs/EtudesFormationsTab';
import { ConnaissancesTab } from '@/features/personnels/components/tabs/ConnaissancesTab';
import { HistoriqueGradesTab } from '@/features/personnels/components/tabs/HistoriqueGradesTab';

import { usePermissions } from '@/hooks/usePermissions';
import { formatDate, formatInitiales } from '@/lib/formatters';

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value && value !== '' ? value : '-'}</p>
    </div>
  );
}

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
            <Field label="Grade" value={p.grade.libelle} />
            <Field label="Categorie" value={p.grade.categorie} />
            <Field label="Unite" value={p.unite.nom} />
            <Field label="Specialite" value={p.specialite?.libelle ?? null} />
            <Field label="Naissance" value={formatDate(p.dateNaissance)} />
            <Field label="Lieu de naissance" value={p.lieuNaissance} />
            <Field label="Fin de lien" value={p.dateFinDeLien ? formatDate(p.dateFinDeLien) : null} />
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Statut</p>
              <p><StatusBadge variant={p.actif ? 'success' : 'muted'}>{p.actif ? 'Actif' : 'Inactif'}</StatusBadge></p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="general">
        <TabsList className="flex-wrap">
          <TabsTrigger value="general">Informations generales</TabsTrigger>
          <TabsTrigger value="enfants">Enfants</TabsTrigger>
          <TabsTrigger value="militaire">Renseignements militaires</TabsTrigger>
          <TabsTrigger value="grades">Historique grades</TabsTrigger>
          <TabsTrigger value="etudes">Etudes et formations</TabsTrigger>
          <TabsTrigger value="connaissances">Connaissances</TabsTrigger>
          <TabsTrigger value="affectations">Affectations</TabsTrigger>
          <TabsTrigger value="decorations">Decorations</TabsTrigger>
          <TabsTrigger value="documents">Pieces jointes</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4">
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
        </TabsContent>

        <TabsContent value="enfants" className="mt-4">
          <EnfantsTab personnelId={p.id} />
        </TabsContent>

        <TabsContent value="militaire" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Renseignements militaires</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Grade" value={p.grade.libelle} />
              <Field label="Unite" value={p.unite.nom} />
              <Field label="Specialite" value={p.specialite?.libelle ?? null} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grades" className="mt-4">
          <HistoriqueGradesTab personnelId={p.id} />
        </TabsContent>

        <TabsContent value="etudes" className="mt-4">
          <EtudesFormationsTab personnelId={p.id} />
        </TabsContent>

        <TabsContent value="connaissances" className="mt-4">
          <ConnaissancesTab personnelId={p.id} />
        </TabsContent>

        <TabsContent value="affectations" className="mt-4">
          <AffectationsTab personnelId={p.id} />
        </TabsContent>

        <TabsContent value="decorations" className="mt-4">
          <DecorationsTab personnelId={p.id} />
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <DocumentsTab personnelId={p.id} />
        </TabsContent>
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