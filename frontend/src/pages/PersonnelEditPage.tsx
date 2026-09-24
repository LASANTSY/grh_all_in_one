import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useEffect } from 'react';

import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { personnelSchema, type PersonnelFormData } from '@/features/personnels/schemas/personnelSchema';
import { personnelDetailService } from '@/features/personnels/services/personnelDetailService';
import { useGrades, useSpecialites, useUnites } from '@/features/referentiels/hooks/useReferentiels';
import { apiClient, type ApiError } from '@/lib/axios';
import type { PersonnelListItem } from '@/types/personnel';

function toDateInput(value: string | null | undefined): string {
  if (!value) return '';
  return value.slice(0, 10);
}

export function PersonnelEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['personnels', 'detail', id],
    queryFn: () => personnelDetailService.get(id!),
    enabled: Boolean(id),
  });

  const gradesQuery = useGrades();
  const unitesQuery = useUnites();
  const specialitesQuery = useSpecialites();

  const methods = useForm<PersonnelFormData>({
    resolver: zodResolver(personnelSchema),
  });

  const { register, handleSubmit, reset, formState: { errors } } = methods;

  useEffect(() => {
    if (query.data) {
      const p = query.data;
      reset({
        matriculeRecrutement: p.matriculeRecrutement,
        matriculeFinancier: p.matriculeFinancier ?? '',
        nom: p.nom,
        prenoms: p.prenoms,
        dateNaissance: toDateInput(p.dateNaissance),
        lieuNaissance: p.lieuNaissance,
        gradeId: p.grade.id,
        uniteId: p.unite.id,
        specialiteId: p.specialite?.id ?? '',
        email: p.email ?? '',
        telephoneMobile: p.telephoneMobile ?? '',
        numeroCIN: p.numeroCIN ?? '',
      });
    }
  }, [query.data, reset]);

  const mutation = useMutation({
    mutationFn: async (data: PersonnelFormData) => {
      const payload = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== '' && v !== undefined && v !== null),
      );
      const { data: result } = await apiClient.patch<PersonnelListItem>(`/personnels/${id}`, payload);
      return result;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['personnels'] });
      navigate(`/personnels/${id}`);
    },
  });

  const apiError =
    mutation.error instanceof AxiosError
      ? (mutation.error.response?.data as ApiError | undefined)
      : undefined;

  if (query.isLoading) return <LoadingSkeleton rows={6} />;
  if (query.isError) return <ErrorState message="Impossible de charger la fiche." onRetry={() => void query.refetch()} />;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(`/personnels/${id}`)}>
        <ArrowLeft className="mr-1 h-4 w-4" /> Retour a la fiche
      </Button>

      <PageHeader title="Modifier la fiche" description={`${query.data?.nom.toUpperCase()} ${query.data?.prenoms}`} />

      {apiError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {apiError.message}
        </div>
      )}

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} noValidate>
        <Tabs defaultValue="general">
          <TabsList className="flex-wrap">
            <TabsTrigger value="general">Informations generales</TabsTrigger>
            <TabsTrigger value="militaire">Renseignements militaires</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-4">
            <Card>
              <CardContent className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1.5"><Label>Matricule de recrutement</Label><Input {...register('matriculeRecrutement')} /></div>
                <div className="space-y-1.5"><Label>Matricule financier</Label><Input {...register('matriculeFinancier')} /></div>
                <div className="space-y-1.5"><Label>Nom</Label><Input {...register('nom')} />{errors.nom && <p className="text-xs text-destructive">{errors.nom.message}</p>}</div>
                <div className="space-y-1.5"><Label>Prenoms</Label><Input {...register('prenoms')} />{errors.prenoms && <p className="text-xs text-destructive">{errors.prenoms.message}</p>}</div>
                <div className="space-y-1.5"><Label>Date de naissance</Label><Input type="date" {...register('dateNaissance')} />{errors.dateNaissance && <p className="text-xs text-destructive">{errors.dateNaissance.message}</p>}</div>
                <div className="space-y-1.5"><Label>Lieu de naissance</Label><Input {...register('lieuNaissance')} /></div>
                <div className="space-y-1.5"><Label>Numero CIN</Label><Input {...register('numeroCIN')} /></div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="militaire" className="mt-4">
            <Card>
              <CardContent className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1.5">
                  <Label>Grade *</Label>
                  <select {...register('gradeId')} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm">
                    {(gradesQuery.data ?? []).map((g) => <option key={g.id} value={g.id}>{g.libelle}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Unite *</Label>
                  <select {...register('uniteId')} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm">
                    {(unitesQuery.data ?? []).map((u) => <option key={u.id} value={u.id}>{u.nom}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Specialite</Label>
                  <select {...register('specialiteId')} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm">
                    <option value="">-- Aucune --</option>
                    {(specialitesQuery.data ?? []).map((s) => <option key={s.id} value={s.id}>{s.libelle}</option>)}
                  </select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="mt-4">
            <Card>
              <CardContent className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1.5"><Label>Email</Label><Input type="email" {...register('email')} />{errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}</div>
                <div className="space-y-1.5"><Label>Telephone mobile</Label><Input {...register('telephoneMobile')} /></div>
                <div className="space-y-1.5"><Label>Adresse actuelle</Label><Input {...register('adresseActuelle')} /></div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(`/personnels/${id}`)}>Annuler</Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enregistrement...</> : <><Save className="mr-2 h-4 w-4" /> Enregistrer</>}
          </Button>
        </div>
      </form>
    </div>
  );
}