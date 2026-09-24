import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { personnelSchema, type PersonnelFormData } from '@/features/personnels/schemas/personnelSchema';
import { useGrades, useSpecialites, useUnites } from '@/features/referentiels/hooks/useReferentiels';
import { apiClient } from '@/lib/axios';
import type { ApiError } from '@/lib/axios';
import type { PersonnelListItem } from '@/types/personnel';

export function PersonnelCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const gradesQuery = useGrades();
  const unitesQuery = useUnites();
  const specialitesQuery = useSpecialites();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PersonnelFormData>({
    resolver: zodResolver(personnelSchema),
    defaultValues: {
      matriculeRecrutement: '',
      nom: '',
      prenoms: '',
      dateNaissance: '',
      lieuNaissance: '',
      gradeId: '',
      uniteId: '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: PersonnelFormData) => {
      const payload = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== '' && v !== undefined && v !== null),
      );
      const { data: result } = await apiClient.post<PersonnelListItem>('/personnels', payload);
      return result;
    },
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ['personnels'] });
      navigate(`/personnels/${result.id}`);
    },
  });

  const apiError =
    mutation.error instanceof AxiosError
      ? (mutation.error.response?.data as ApiError | undefined)
      : undefined;

  const onSubmit = (data: PersonnelFormData): void => {
    mutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/personnels')}>
        <ArrowLeft className="mr-1 h-4 w-4" /> Retour
      </Button>

      <PageHeader title="Nouveau personnel" description="Saisie d une nouvelle fiche individuelle" />

      {apiError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {apiError.message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Tabs defaultValue="general">
          <TabsList className="flex-wrap">
            <TabsTrigger value="general">Informations generales</TabsTrigger>
            <TabsTrigger value="militaire">Renseignements militaires</TabsTrigger>
            <TabsTrigger value="famille">Situation familiale</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-4">
            <Card>
              <CardContent className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="matriculeRecrutement">Matricule de recrutement *</Label>
                  <Input id="matriculeRecrutement" {...register('matriculeRecrutement')} />
                  {errors.matriculeRecrutement && <p className="text-xs text-destructive">{errors.matriculeRecrutement.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="matriculeFinancier">Matricule financier</Label>
                  <Input id="matriculeFinancier" {...register('matriculeFinancier')} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="nom">Nom *</Label>
                  <Input id="nom" {...register('nom')} />
                  {errors.nom && <p className="text-xs text-destructive">{errors.nom.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prenoms">Prenoms *</Label>
                  <Input id="prenoms" {...register('prenoms')} />
                  {errors.prenoms && <p className="text-xs text-destructive">{errors.prenoms.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="dateNaissance">Date de naissance *</Label>
                  <Input id="dateNaissance" type="date" {...register('dateNaissance')} />
                  {errors.dateNaissance && <p className="text-xs text-destructive">{errors.dateNaissance.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lieuNaissance">Lieu de naissance *</Label>
                  <Input id="lieuNaissance" {...register('lieuNaissance')} />
                  {errors.lieuNaissance && <p className="text-xs text-destructive">{errors.lieuNaissance.message}</p>}
                </div>
                <div className="space-y-1.5"><Label>Prefecture</Label><Input {...register('prefecture')} /></div>
                <div className="space-y-1.5"><Label>Province</Label><Input {...register('province')} /></div>
                <div className="space-y-1.5"><Label>Numero CIN</Label><Input {...register('numeroCIN')} /></div>
                <div className="space-y-1.5"><Label>Religion</Label><Input {...register('religion')} /></div>
                <div className="space-y-1.5"><Label>Groupe sanguin</Label><Input {...register('groupeSanguin')} /></div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="militaire" className="mt-4">
            <Card>
              <CardContent className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="gradeId">Grade *</Label>
                  <select id="gradeId" {...register('gradeId')} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm">
                    <option value="">-- Selectionner --</option>
                    {(gradesQuery.data ?? []).map((g) => (
                      <option key={g.id} value={g.id}>{g.libelle}</option>
                    ))}
                  </select>
                  {errors.gradeId && <p className="text-xs text-destructive">{errors.gradeId.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="uniteId">Unite *</Label>
                  <select id="uniteId" {...register('uniteId')} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm">
                    <option value="">-- Selectionner --</option>
                    {(unitesQuery.data ?? []).map((u) => (
                      <option key={u.id} value={u.id}>{u.nom} ({u.code})</option>
                    ))}
                  </select>
                  {errors.uniteId && <p className="text-xs text-destructive">{errors.uniteId.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="specialiteId">Specialite</Label>
                  <select id="specialiteId" {...register('specialiteId')} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm">
                    <option value="">-- Aucune --</option>
                    {(specialitesQuery.data ?? []).map((s) => (
                      <option key={s.id} value={s.id}>{s.libelle}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5"><Label>Corps</Label><Input {...register('corps')} /></div>
                <div className="space-y-1.5"><Label>Lieu d emploi</Label><Input {...register('lieuEmploi')} /></div>
                <div className="space-y-1.5"><Label>Fonction actuelle</Label><Input {...register('fonctionActuelle')} /></div>
                <div className="space-y-1.5"><Label>Situation militaire</Label><Input {...register('situationMilitaire')} /></div>
                <div className="space-y-1.5"><Label>Date d entree en service</Label><Input type="date" {...register('dateEntreeService')} /></div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="famille" className="mt-4">
            <Card>
              <CardContent className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1.5"><Label>Statut familial</Label><Input {...register('statutFamilial')} /></div>
                <div className="space-y-1.5"><Label>Nom du conjoint</Label><Input {...register('nomConjoint')} /></div>
                <div className="space-y-1.5"><Label>Nom du pere</Label><Input {...register('nomPere')} /></div>
                <div className="space-y-1.5"><Label>Nom de la mere</Label><Input {...register('nomMere')} /></div>
                <div className="space-y-1.5"><Label>Sports pratiques</Label><Input {...register('sportsPratiques')} /></div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="mt-4">
            <Card>
              <CardContent className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1.5"><Label>Email</Label><Input type="email" {...register('email')} /></div>
                <div className="space-y-1.5"><Label>Telephone mobile</Label><Input {...register('telephoneMobile')} /></div>
                <div className="space-y-1.5"><Label>Adresse actuelle</Label><Input {...register('adresseActuelle')} /></div>
                <div className="space-y-1.5"><Label>Adresse de repli</Label><Input {...register('adresseRepli')} /></div>
                <div className="space-y-1.5"><Label>Contact d urgence</Label><Input {...register('contactUrgence')} /></div>
                <div className="space-y-1.5"><Label>Niveau d instruction</Label><Input {...register('niveauInstruction')} /></div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/personnels')}>
            Annuler
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enregistrement...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Enregistrer
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}